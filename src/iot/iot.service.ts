import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  SensorData,
  Tracker,
  TrackingChannel,
  Trip,
  Vehicle,
} from '../common/entities';
import { TripStatus } from '../common/types/trip-status';
import { TelemetryDto } from './dto';
import { MqttAuthResult } from './types/mqtt-auth-result';
import { TelemetryCacheService } from './telemetry-cache.service';
import { MQTT_TOPICS, TRACKER_USERNAME_PATTERN } from './iot.constants';
import { SaveTelemetryResult } from './types/save-telemetry-result';

@Injectable()
export class IotService {
  private readonly logger = new Logger(IotService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: TelemetryCacheService,
    @InjectRepository(Tracker)
    private trackerRepository: Repository<Tracker>,
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(TrackingChannel)
    private trackingChannelRepository: Repository<TrackingChannel>,
  ) {}

  async authenticate(
    username: string,
    password: string,
  ): Promise<MqttAuthResult> {
    const internalUsername = this.configService.get<string>(
      'MQTT_INTERNAL_USERNAME',
    );
    const internalPassword = this.configService.get<string>(
      'MQTT_INTERNAL_PASSWORD',
    );

    if (username === internalUsername && password === internalPassword) {
      return { type: 'internal' };
    }

    const trackerId = this.parseTrackerUsername(username);
    if (!trackerId) {
      this.logger.warn(`Invalid tracker username format: ${username}`);
      return null;
    }

    const tracker = await this.trackerRepository.findOne({
      where: { tracker_id: trackerId },
    });

    if (!tracker) {
      this.logger.warn(`Tracker not found: ${trackerId}`);
      return null;
    }

    const isValid = await bcrypt.compare(
      password,
      tracker.device_secret_token_hash,
    );

    if (!isValid) {
      this.logger.warn(`Invalid token for tracker: ${trackerId}`);
      return null;
    }

    return { type: 'tracker', tracker };
  }

  parseTrackerUsername(username: string): number | null {
    const match = username.match(TRACKER_USERNAME_PATTERN);
    return match ? parseInt(match[1], 10) : null;
  }

  checkAcl(
    username: string,
    topic: string,
    action: 'publish' | 'subscribe',
  ): boolean {
    const internalUsername = this.configService.get<string>(
      'MQTT_INTERNAL_USERNAME',
    );

    if (username === internalUsername) {
      return action === 'subscribe' && topic === MQTT_TOPICS.TELEMETRY_WILDCARD;
    }

    const trackerId = this.parseTrackerUsername(username);
    if (!trackerId) {
      return false;
    }

    return (
      action === 'publish' &&
      topic === `${MQTT_TOPICS.TELEMETRY_PREFIX}${trackerId}`
    );
  }

  async findActiveTrip(vehicleId: number): Promise<Trip | null> {
    return this.tripRepository.findOne({
      where: {
        vehicle_id: vehicleId,
        status: TripStatus.IN_PROGRESS,
      },
    });
  }

  async getActiveTripData(
    trackerId: number,
    vehicleId: number,
  ): Promise<{ tripId: number; companyId: number } | null> {
    const cached = await this.cacheService.getTripMapping(trackerId);
    if (cached && cached.vehicleId === vehicleId && cached.companyId) {
      return { tripId: cached.tripId, companyId: cached.companyId };
    }

    const trip = await this.findActiveTrip(vehicleId);
    if (!trip) {
      return null;
    }

    await this.cacheService.setTripMapping(trackerId, {
      vehicleId,
      tripId: trip.trip_id,
      companyId: trip.company_id,
    });

    return { tripId: trip.trip_id, companyId: trip.company_id };
  }

  async saveTelemetry(
    tracker: Tracker,
    telemetry: TelemetryDto,
  ): Promise<SaveTelemetryResult | null> {
    if (!tracker.vehicle_id) {
      return null;
    }

    const datetime = new Date(telemetry.datetime);

    const tripData = await this.getActiveTripData(
      tracker.tracker_id,
      tracker.vehicle_id,
    );

    if (tripData) {
      const sensorData = this.sensorDataRepository.create({
        trip_id: tripData.tripId,
        latitude: Number(telemetry.latitude),
        longitude: Number(telemetry.longitude),
        speed: telemetry.speed ? Number(telemetry.speed) : undefined,
        bearing: telemetry.bearing ? Number(telemetry.bearing) : undefined,
        datetime,
        temperature: telemetry.temperature
          ? Number(telemetry.temperature)
          : undefined,
        humidity: telemetry.humidity ? Number(telemetry.humidity) : undefined,
      });

      const saved = await this.sensorDataRepository.save(sensorData);
      return {
        sensorData: saved,
        tripId: tripData.tripId,
        companyId: tripData.companyId,
      };
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicle_id: tracker.vehicle_id },
      select: ['vehicle_id', 'company_id'],
    });

    if (!vehicle || !vehicle.company_id) {
      return null;
    }

    await this.vehicleRepository.update(tracker.vehicle_id, {
      last_latitude: Number(telemetry.latitude),
      last_longitude: Number(telemetry.longitude),
      last_speed: telemetry.speed ? Number(telemetry.speed) : undefined,
      last_bearing: telemetry.bearing ? Number(telemetry.bearing) : undefined,
      last_temperature: telemetry.temperature
        ? Number(telemetry.temperature)
        : undefined,
      last_humidity: telemetry.humidity
        ? Number(telemetry.humidity)
        : undefined,
      last_update_time: datetime,
    });

    return {
      sensorData: {
        latitude: Number(telemetry.latitude),
        longitude: Number(telemetry.longitude),
        speed: telemetry.speed ? Number(telemetry.speed) : undefined,
        bearing: telemetry.bearing ? Number(telemetry.bearing) : undefined,
        temperature: telemetry.temperature
          ? Number(telemetry.temperature)
          : undefined,
        humidity: telemetry.humidity ? Number(telemetry.humidity) : undefined,
        datetime,
      } as SensorData,
      tripId: null,
      companyId: vehicle.company_id,
    };
  }

  async saveBatchTelemetry(
    tracker: Tracker,
    batch: TelemetryDto[],
  ): Promise<SaveTelemetryResult | null> {
    if (!tracker.vehicle_id || batch.length === 0) {
      return null;
    }

    const sortedBatch = [...batch].sort((a, b) => {
      const dateA = new Date(a.datetime);
      const dateB = new Date(b.datetime);
      return dateA.getTime() - dateB.getTime();
    });

    const minTimestamp = new Date(sortedBatch[0].datetime);
    const maxTimestamp = new Date(sortedBatch[sortedBatch.length - 1].datetime);

    const trips = await this.tripRepository
      .createQueryBuilder('trip')
      .where('trip.vehicle_id = :vehicleId', { vehicleId: tracker.vehicle_id })
      .andWhere('trip.actual_start_datetime <= :maxTimestamp', { maxTimestamp })
      .andWhere(
        '(trip.end_datetime IS NULL OR trip.end_datetime >= :minTimestamp)',
        { minTimestamp },
      )
      .orderBy('trip.actual_start_datetime', 'ASC')
      .getMany();

    const findTripForTimestamp = (timestamp: Date): Trip | null => {
      for (const trip of trips) {
        if (
          trip.actual_start_datetime &&
          trip.actual_start_datetime <= timestamp &&
          (!trip.end_datetime || trip.end_datetime >= timestamp)
        ) {
          return trip;
        }
      }
      return null;
    };

    const sensorDataBatch: SensorData[] = [];

    for (const telemetry of sortedBatch) {
      const datetime = new Date(telemetry.datetime);
      const trip = findTripForTimestamp(datetime);

      if (trip) {
        sensorDataBatch.push(
          this.sensorDataRepository.create({
            trip_id: trip.trip_id,
            latitude: Number(telemetry.latitude),
            longitude: Number(telemetry.longitude),
            speed: telemetry.speed ? Number(telemetry.speed) : undefined,
            bearing: telemetry.bearing ? Number(telemetry.bearing) : undefined,
            datetime,
            temperature: telemetry.temperature
              ? Number(telemetry.temperature)
              : undefined,
            humidity: telemetry.humidity
              ? Number(telemetry.humidity)
              : undefined,
          }),
        );
      }
    }

    if (sensorDataBatch.length > 0) {
      await this.sensorDataRepository.save(sensorDataBatch);
    }

    return this.saveTelemetry(tracker, sortedBatch[sortedBatch.length - 1]);
  }

  async getChannelTokensByTripId(tripId: number): Promise<string[]> {
    const channels = await this.trackingChannelRepository.find({
      where: { assigned_trip_id: tripId },
      select: ['public_token'],
    });

    return channels.map((c) => c.public_token);
  }

  async invalidateVehicleTripCache(vehicleId: number): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicle_id: vehicleId },
      relations: ['tracker'],
    });

    if (vehicle?.tracker) {
      await this.cacheService.invalidateTripMapping(vehicle.tracker.tracker_id);
    }
  }
}
