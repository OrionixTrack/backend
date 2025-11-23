import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as polyline from '@mapbox/polyline';
import { Driver, SensorData, Trip, Vehicle } from '../common/entities';
import { TripSortField } from './dto/trip-query.dto';
import { DriverTripQueryDto } from '../driver/dto/driver-trip-query.dto';
import { ActiveTripResponseDto } from '../driver/dto/active-trip-response.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { TripMapper } from './trip.mapper';
import { TripStatus } from '../common/types/trip-status';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { IotService } from '../iot/iot.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { DispatcherTripQueryDto } from './dto/dispatcher-trip-query.dto';
import { ChartSeriesPoint, TripStatsResponseDto } from './dto/trip-stats.dto';
import { TRIP_STATS_CHART_POINT_COUNT } from './trip.constants';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private readonly iotService: IotService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(
    companyId: number,
    query: DispatcherTripQueryDto,
    dispatcherId?: number,
  ): Promise<TripResponseDto[]> {
    const qb = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.assignedDriver', 'driver')
      .leftJoinAndSelect('trip.vehicle', 'vehicle')
      .leftJoinAndSelect('trip.createdByDispatcher', 'dispatcher')
      .where('trip.company_id = :companyId', { companyId });

    if (query.createdByMe && dispatcherId) {
      qb.andWhere('trip.created_by_dispatcher_id = :dispatcherId', {
        dispatcherId,
      });
    }

    this.applySearchFilter(qb, query.search);

    if (query.status) {
      qb.andWhere('trip.status = :status', { status: query.status });
    }

    this.applyDateFilters(qb, query.dateFrom, query.dateTo);

    const trips = await qb
      .orderBy(`trip.${query.sortBy}`, query.sortOrder)
      .skip(query.offset)
      .take(query.limit)
      .getMany();

    return trips.map((trip) => TripMapper.toDto(trip));
  }

  async findOne(tripId: number, companyId: number): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
      relations: ['assignedDriver', 'vehicle', 'createdByDispatcher'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const [trackPolyline, currentTelemetry] = await Promise.all([
      this.getTrackPolyline(tripId),
      this.getLatestTelemetry(tripId),
    ]);

    return TripMapper.toDto(trip, trackPolyline, currentTelemetry);
  }

  private async getLatestTelemetry(tripId: number): Promise<SensorData | null> {
    return this.sensorDataRepository.findOne({
      where: { trip_id: tripId },
      order: { datetime: 'DESC' },
    });
  }

  async create(
    companyId: number,
    dispatcherId: number,
    dto: CreateTripDto,
  ): Promise<TripResponseDto> {
    if (dto.driverId) {
      await this.validateDriver(dto.driverId, companyId);
    }

    if (dto.vehicleId) {
      await this.validateVehicle(dto.vehicleId, companyId);
    }

    const trip = this.tripRepository.create({
      name: dto.name,
      description: dto.description,
      planned_start_datetime: dto.plannedStart
        ? new Date(dto.plannedStart)
        : undefined,
      contact_info: dto.contactInfo,
      start_address: dto.startAddress,
      start_latitude: dto.startLatitude,
      start_longitude: dto.startLongitude,
      finish_address: dto.finishAddress,
      finish_latitude: dto.finishLatitude,
      finish_longitude: dto.finishLongitude,
      company_id: companyId,
      created_by_dispatcher_id: dispatcherId,
      assigned_driver_id: dto.driverId,
      vehicle_id: dto.vehicleId,
      status: TripStatus.PLANNED,
    });

    const savedTrip = await this.tripRepository.save(trip);

    return this.findOne(savedTrip.trip_id, companyId);
  }

  async update(
    tripId: number,
    companyId: number,
    dto: UpdateTripDto,
  ): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.PLANNED) {
      throw new ForbiddenException('Only planned trips can be updated');
    }

    if (dto.driverId !== undefined) {
      if (dto.driverId !== null) {
        await this.validateDriver(dto.driverId, companyId);
      }
      trip.assigned_driver_id = dto.driverId ?? undefined;
    }

    if (dto.vehicleId !== undefined) {
      if (dto.vehicleId !== null) {
        await this.validateVehicle(dto.vehicleId, companyId);
      }
      trip.vehicle_id = dto.vehicleId ?? undefined;
    }

    if (dto.name !== undefined) trip.name = dto.name;
    if (dto.description !== undefined) trip.description = dto.description;
    if (dto.plannedStart !== undefined) {
      trip.planned_start_datetime = dto.plannedStart
        ? new Date(dto.plannedStart)
        : undefined;
    }
    if (dto.contactInfo !== undefined) trip.contact_info = dto.contactInfo;
    if (dto.startAddress !== undefined) trip.start_address = dto.startAddress;
    if (dto.startLatitude !== undefined)
      trip.start_latitude = dto.startLatitude;
    if (dto.startLongitude !== undefined)
      trip.start_longitude = dto.startLongitude;
    if (dto.finishAddress !== undefined)
      trip.finish_address = dto.finishAddress;
    if (dto.finishLatitude !== undefined)
      trip.finish_latitude = dto.finishLatitude;
    if (dto.finishLongitude !== undefined)
      trip.finish_longitude = dto.finishLongitude;

    await this.tripRepository.save(trip);

    return this.findOne(tripId, companyId);
  }

  async assignDriver(
    tripId: number,
    companyId: number,
    driverId: number | null,
  ): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.PLANNED) {
      throw new ForbiddenException('Can only assign driver to planned trips');
    }

    if (driverId !== null) {
      await this.validateDriver(driverId, companyId);
    }

    trip.assigned_driver_id = driverId ?? undefined;
    await this.tripRepository.save(trip);

    return this.findOne(tripId, companyId);
  }

  async assignVehicle(
    tripId: number,
    companyId: number,
    vehicleId: number | null,
  ): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.PLANNED) {
      throw new ForbiddenException('Can only assign vehicle to planned trips');
    }

    if (vehicleId !== null) {
      await this.validateVehicle(vehicleId, companyId);
    }

    trip.vehicle_id = vehicleId ?? undefined;
    await this.tripRepository.save(trip);

    return this.findOne(tripId, companyId);
  }

  async startTrip(tripId: number, companyId: number): Promise<TripResponseDto> {
    const trip = await this.getTripByCompany(tripId, companyId);
    await this.performStartTrip(trip);
    return this.findOne(tripId, companyId);
  }

  async endTrip(tripId: number, companyId: number): Promise<TripResponseDto> {
    const trip = await this.getTripByCompany(tripId, companyId);
    await this.performEndTrip(trip);
    return this.findOne(tripId, companyId);
  }

  async cancelTrip(
    tripId: number,
    companyId: number,
  ): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (
      trip.status === TripStatus.COMPLETED ||
      trip.status === TripStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        'Cannot cancel completed or already cancelled trips',
      );
    }

    trip.status = TripStatus.CANCELLED;
    trip.end_datetime = new Date();
    await this.tripRepository.save(trip);

    if (trip.vehicle_id) {
      await this.iotService.invalidateVehicleTripCache(trip.vehicle_id);
    }

    await this.broadcastTripStatus(tripId, companyId, TripStatus.CANCELLED);

    return this.findOne(tripId, companyId);
  }

  private async getTrackPolyline(tripId: number): Promise<string | null> {
    const sensorData = await this.sensorDataRepository.find({
      where: { trip_id: tripId },
      order: { datetime: 'ASC' },
      select: ['latitude', 'longitude'],
    });

    if (sensorData.length === 0) {
      return null;
    }

    const coordinates = sensorData.map(
      (point) =>
        [Number(point.latitude), Number(point.longitude)] as [number, number],
    );

    return polyline.encode(coordinates);
  }

  private async validateDriver(
    driverId: number,
    companyId: number,
  ): Promise<void> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: driverId, company_id: companyId },
    });

    if (!driver) {
      throw new BadRequestException(
        'Driver not found or does not belong to your company',
      );
    }
  }

  private async validateVehicle(
    vehicleId: number,
    companyId: number,
  ): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicle_id: vehicleId, company_id: companyId },
    });

    if (!vehicle) {
      throw new BadRequestException(
        'Vehicle not found or does not belong to your company',
      );
    }

    if (!vehicle.is_active) {
      throw new BadRequestException('Vehicle is not active');
    }
  }

  private async getTripByCompany(
    tripId: number,
    companyId: number,
  ): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  private async getTripByDriver(
    tripId: number,
    driverId: number,
  ): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, assigned_driver_id: driverId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found or not assigned to you');
    }

    return trip;
  }

  private async performStartTrip(trip: Trip): Promise<void> {
    if (trip.status !== TripStatus.PLANNED) {
      throw new ForbiddenException('Can only start planned trips');
    }

    if (!trip.vehicle_id) {
      throw new BadRequestException(
        'Vehicle must be assigned before starting trip',
      );
    }

    await this.validateNoActiveTrips(trip);

    trip.status = TripStatus.IN_PROGRESS;
    trip.actual_start_datetime = new Date();
    await this.tripRepository.save(trip);

    await this.broadcastTripStatus(
      trip.trip_id,
      trip.company_id,
      TripStatus.IN_PROGRESS,
    );
  }

  private async validateNoActiveTrips(trip: Trip): Promise<void> {
    if (trip.assigned_driver_id) {
      const driverActiveTrip = await this.tripRepository.findOne({
        where: {
          assigned_driver_id: trip.assigned_driver_id,
          status: TripStatus.IN_PROGRESS,
        },
      });

      if (driverActiveTrip) {
        throw new BadRequestException(
          'Driver already has an active trip in progress',
        );
      }
    }

    const vehicleActiveTrip = await this.tripRepository.findOne({
      where: {
        vehicle_id: trip.vehicle_id,
        status: TripStatus.IN_PROGRESS,
      },
    });

    if (vehicleActiveTrip) {
      throw new BadRequestException(
        'Vehicle already has an active trip in progress',
      );
    }
  }

  private async performEndTrip(trip: Trip): Promise<void> {
    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new ForbiddenException('Can only end trips that are in progress');
    }

    trip.status = TripStatus.COMPLETED;
    trip.end_datetime = new Date();
    await this.tripRepository.save(trip);

    if (trip.vehicle_id) {
      await this.iotService.invalidateVehicleTripCache(trip.vehicle_id);
    }

    await this.broadcastTripStatus(
      trip.trip_id,
      trip.company_id,
      TripStatus.COMPLETED,
    );
  }

  private async broadcastTripStatus(
    tripId: number,
    companyId: number,
    status: TripStatus,
  ): Promise<void> {
    const channelTokens =
      await this.iotService.getChannelTokensByTripId(tripId);
    this.realtimeGateway.broadcastTripStatusChange(
      tripId,
      companyId,
      channelTokens,
      {
        tripId,
        status,
      },
    );
  }

  private applySearchFilter(
    qb: ReturnType<Repository<Trip>['createQueryBuilder']>,
    search?: string,
  ): void {
    if (search) {
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('trip.name ILIKE :search', { search: `%${search}%` })
            .orWhere('trip.start_address ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('trip.finish_address ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }
  }

  private applyDateFilters(
    qb: ReturnType<Repository<Trip>['createQueryBuilder']>,
    dateFrom?: string,
    dateTo?: string,
  ): void {
    if (dateFrom) {
      qb.andWhere('trip.planned_start_datetime >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      qb.andWhere('trip.planned_start_datetime <= :dateTo', { dateTo });
    }
  }

  async findAllForDriver(
    driverId: number,
    query: DriverTripQueryDto,
    includeHistory: boolean,
  ): Promise<TripResponseDto[]> {
    const qb = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.assignedDriver', 'driver')
      .leftJoinAndSelect('trip.vehicle', 'vehicle')
      .leftJoinAndSelect('trip.createdByDispatcher', 'dispatcher')
      .where('trip.assigned_driver_id = :driverId', { driverId });

    const statuses = includeHistory
      ? [TripStatus.COMPLETED, TripStatus.CANCELLED]
      : [TripStatus.PLANNED, TripStatus.IN_PROGRESS];
    qb.andWhere('trip.status IN (:...statuses)', { statuses });

    this.applySearchFilter(qb, query.search);
    this.applyDateFilters(qb, query.dateFrom, query.dateTo);

    const sortBy = query.sortBy ?? TripSortField.START_DATE;
    const trips = await qb
      .orderBy(`trip.${sortBy}`, query.sortOrder)
      .skip(query.offset)
      .take(query.limit)
      .getMany();

    return trips.map((trip) => TripMapper.toDto(trip));
  }

  async findActiveForDriver(driverId: number): Promise<ActiveTripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: {
        assigned_driver_id: driverId,
        status: TripStatus.IN_PROGRESS,
      },
      relations: ['assignedDriver', 'vehicle', 'createdByDispatcher'],
    });

    if (!trip) {
      return { activeTrip: null };
    }

    const [trackPolyline, currentTelemetry] = await Promise.all([
      this.getTrackPolyline(trip.trip_id),
      this.getLatestTelemetry(trip.trip_id),
    ]);
    return {
      activeTrip: TripMapper.toDto(trip, trackPolyline, currentTelemetry),
    };
  }

  async findOneForDriver(
    tripId: number,
    driverId: number,
  ): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, assigned_driver_id: driverId },
      relations: ['assignedDriver', 'vehicle', 'createdByDispatcher'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found or not assigned to you');
    }

    const [trackPolyline, currentTelemetry] = await Promise.all([
      this.getTrackPolyline(tripId),
      this.getLatestTelemetry(tripId),
    ]);
    return TripMapper.toDto(trip, trackPolyline, currentTelemetry);
  }

  async startTripByDriver(
    tripId: number,
    driverId: number,
  ): Promise<TripResponseDto> {
    const trip = await this.getTripByDriver(tripId, driverId);
    await this.performStartTrip(trip);
    return this.findOneForDriver(tripId, driverId);
  }

  async endTripByDriver(
    tripId: number,
    driverId: number,
  ): Promise<TripResponseDto> {
    const trip = await this.getTripByDriver(tripId, driverId);
    await this.performEndTrip(trip);
    return this.findOneForDriver(tripId, driverId);
  }

  async getStats(
    tripId: number,
    companyId: number,
  ): Promise<TripStatsResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
      select: ['trip_id'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const [statsRaw, rawData] = await Promise.all([
      this.sensorDataRepository
        .createQueryBuilder('sd')
        .select([
          'MIN(sd.temperature)::float as temp_min',
          'MAX(sd.temperature)::float as temp_max',
          'AVG(sd.temperature)::float as temp_avg',
          'MIN(sd.humidity)::float as humid_min',
          'MAX(sd.humidity)::float as humid_max',
          'AVG(sd.humidity)::float as humid_avg',
          'MIN(sd.speed)::float as speed_min',
          'MAX(sd.speed)::float as speed_max',
          'AVG(sd.speed)::float as speed_avg',
          'COUNT(sd.sensor_data_id)::int as total_points',
        ])
        .where('sd.trip_id = :tripId', { tripId })
        .getRawOne<{
          temp_min: number;
          temp_max: number;
          temp_avg: number;
          humid_min: number;
          humid_max: number;
          humid_avg: number;
          speed_min: number;
          speed_max: number;
          speed_avg: number;
          total_points: number;
        }>(),

      this.sensorDataRepository
        .createQueryBuilder('sd')
        .select([
          'sd.datetime as datetime',
          'sd.temperature::float as temperature',
          'sd.humidity::float as humidity',
          'sd.speed::float as speed',
        ])
        .where('sd.trip_id = :tripId', { tripId })
        .orderBy('sd.datetime', 'ASC')
        .getRawMany<{
          datetime: string;
          temperature: number | null;
          humidity: number | null;
          speed: number | null;
        }>(),
    ]);

    if (!statsRaw || statsRaw.total_points === 0) {
      return {
        tripId,
        totalPoints: 0,
      };
    }

    const speedRaw: ChartSeriesPoint[] = [];
    const tempRaw: ChartSeriesPoint[] = [];
    const humidRaw: ChartSeriesPoint[] = [];

    for (const row of rawData) {
      const datetime = new Date(row.datetime);

      if (row.speed != null) {
        speedRaw.push({ datetime, value: row.speed });
      }

      if (row.temperature != null) {
        tempRaw.push({ datetime, value: row.temperature });
      }

      if (row.humidity != null) {
        humidRaw.push({ datetime, value: row.humidity });
      }
    }

    const formatStat = (avg: number | undefined, min: number, max: number) =>
      avg ? { min, max, avg: Math.round(avg * 100) / 100 } : undefined;

    return {
      tripId,
      totalPoints: statsRaw?.total_points || 0,

      temperature: formatStat(
        statsRaw?.temp_avg,
        statsRaw?.temp_min,
        statsRaw?.temp_max,
      ),
      humidity: formatStat(
        statsRaw?.humid_avg,
        statsRaw?.humid_min,
        statsRaw?.humid_max,
      ),
      speed: formatStat(
        statsRaw?.speed_avg,
        statsRaw?.speed_min,
        statsRaw?.speed_max,
      ),

      speedChart:
        speedRaw.length > 0
          ? this.downsampleMetric(speedRaw, TRIP_STATS_CHART_POINT_COUNT)
          : undefined,

      temperatureChart:
        tempRaw.length > 0
          ? this.downsampleMetric(tempRaw, TRIP_STATS_CHART_POINT_COUNT)
          : undefined,

      humidityChart:
        humidRaw.length > 0
          ? this.downsampleMetric(humidRaw, TRIP_STATS_CHART_POINT_COUNT)
          : undefined,
    };
  }

  private downsampleMetric(
    data: ChartSeriesPoint[],
    targetPoints: number,
  ): ChartSeriesPoint[] {
    if (data.length <= targetPoints) {
      return data;
    }

    const blockSize = data.length / targetPoints;
    const sampled: ChartSeriesPoint[] = [];

    sampled.push(data[0]);

    for (let i = 0; i < targetPoints - 2; i++) {
      const start = Math.floor((i + 1) * blockSize);
      const end = Math.floor((i + 2) * blockSize);

      const chunk = data.slice(start, end);

      if (chunk.length === 0) {
        continue;
      }

      let minPoint = chunk[0];
      let maxPoint = chunk[0];
      let sum = 0;

      for (const p of chunk) {
        sum += p.value;
        if (p.value < minPoint.value) minPoint = p;
        if (p.value > maxPoint.value) maxPoint = p;
      }

      const avg = sum / chunk.length;

      const maxDeviation = Math.abs(maxPoint.value - avg);
      const minDeviation = Math.abs(minPoint.value - avg);

      const bestPoint = maxDeviation >= minDeviation ? maxPoint : minPoint;

      sampled.push(bestPoint);
    }

    sampled.push(data[data.length - 1]);

    return sampled;
  }
}
