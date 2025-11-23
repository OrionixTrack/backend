import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SensorData, Tracker, Trip, Vehicle } from '../common/entities';
import { TripStatus } from '../common/types/trip-status';
import { TelemetryDto } from './dto';
import { MqttAuthResult } from './types/mqtt-auth-result';
import { TelemetryCacheService } from './telemetry-cache.service';
import { TRACKER_USERNAME_PATTERN, MQTT_TOPICS } from './iot.constants';

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

  async getActiveTripId(
    trackerId: number,
    vehicleId: number,
  ): Promise<number | null> {
    const cached = await this.cacheService.getTripMapping(trackerId);
    if (cached && cached.vehicleId === vehicleId) {
      return cached.tripId;
    }

    const trip = await this.findActiveTrip(vehicleId);
    if (!trip) {
      return null;
    }

    await this.cacheService.setTripMapping(trackerId, {
      vehicleId,
      tripId: trip.trip_id,
    });

    return trip.trip_id;
  }

  async saveTelemetry(
    tracker: Tracker,
    telemetry: TelemetryDto,
  ): Promise<SensorData | null> {
    if (!tracker.vehicle_id) {
      return null;
    }

    const tripId = await this.getActiveTripId(
      tracker.tracker_id,
      tracker.vehicle_id,
    );

    if (!tripId) {
      return null;
    }

    const datetime = telemetry.datetime
      ? new Date(telemetry.datetime)
      : new Date();

    const sensorData = this.sensorDataRepository.create({
      trip_id: tripId,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      speed: telemetry.speed,
      datetime,
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
    });

    return await this.sensorDataRepository.save(sensorData);
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
