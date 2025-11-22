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
import { TripQueryDto } from './dto/trip-query.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { TripMapper } from './trip.mapper';
import { TripStatus } from '../common/types/trip-status';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

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
  ) {}

  async findAll(
    companyId: number,
    query: TripQueryDto,
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

    if (query.search) {
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('trip.name ILIKE :search', { search: `%${query.search}%` })
            .orWhere('trip.start_address ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('trip.finish_address ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    if (query.status) {
      qb.andWhere('trip.status = :status', { status: query.status });
    }

    if (query.dateFrom) {
      qb.andWhere('trip.planned_start_datetime >= :dateFrom', {
        dateFrom: query.dateFrom,
      });
    }
    if (query.dateTo) {
      qb.andWhere('trip.planned_start_datetime <= :dateTo', {
        dateTo: query.dateTo,
      });
    }

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

    const trackPolyline = await this.getTrackPolyline(tripId);

    return TripMapper.toDto(trip, trackPolyline);
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
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.PLANNED) {
      throw new ForbiddenException('Can only start planned trips');
    }

    if (!trip.vehicle_id) {
      throw new BadRequestException(
        'Vehicle must be assigned before starting trip',
      );
    }

    trip.status = TripStatus.IN_PROGRESS;
    trip.actual_start_datetime = new Date();
    await this.tripRepository.save(trip);

    return this.findOne(tripId, companyId);
  }

  async endTrip(tripId: number, companyId: number): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new ForbiddenException('Can only end trips that are in progress');
    }

    trip.status = TripStatus.COMPLETED;
    trip.end_datetime = new Date();
    await this.tripRepository.save(trip);

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
}
