import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Not, Repository } from 'typeorm';
import { Tracker, Trip, Vehicle } from '../../common/entities';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleMapper } from './vehicle.mapper';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { TripStatus } from '../../common/types/trip-status';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Tracker)
    private trackerRepository: Repository<Tracker>,
  ) {}

  async findAll(
    companyId: number,
    query: VehicleQueryDto,
  ): Promise<VehicleResponseDto[]> {
    const qb = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.tracker', 'tracker')
      .where('vehicle.company_id = :companyId', { companyId });

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('vehicle.name ILIKE :search', {
            search: `%${query.search}%`,
          })
            .orWhere('vehicle.license_plate ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('vehicle.brand ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('vehicle.model ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    const vehicles = await qb
      .orderBy(`vehicle.${query.sortBy}`, query.sortOrder)
      .skip(query.offset)
      .take(query.limit)
      .getMany();

    return vehicles.map((vehicle) => VehicleMapper.toDto(vehicle));
  }

  async findOne(id: number, companyId: number): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicle_id: id, company_id: companyId },
      relations: ['tracker'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return VehicleMapper.toDto(vehicle);
  }

  async create(
    companyId: number,
    createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { license_plate: createVehicleDto.license_plate },
    });

    if (existingVehicle) {
      throw new ConflictException(
        'Vehicle with this license plate already exists',
      );
    }

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      company_id: companyId,
    });

    const savedVehicle = await this.vehicleRepository.save(vehicle);

    return VehicleMapper.toDto(savedVehicle);
  }

  async update(
    id: number,
    companyId: number,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicle_id: id, company_id: companyId },
      relations: ['tracker'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const existingVehicle = await this.vehicleRepository.findOne({
      where: {
        license_plate: updateVehicleDto.license_plate,
        vehicle_id: Not(id),
      },
    });

    if (existingVehicle) {
      throw new ConflictException(
        'Vehicle with this license plate already exists',
      );
    }

    Object.assign(vehicle, updateVehicleDto);
    const updatedVehicle = await this.vehicleRepository.save(vehicle);

    return VehicleMapper.toDto(updatedVehicle);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicle_id: id, company_id: companyId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const hasFutureTrips = await this.tripRepository.exists({
      where: {
        vehicle_id: id,
        status: In([TripStatus.PLANNED, TripStatus.IN_PROGRESS]),
      },
    });

    if (hasFutureTrips) {
      throw new ConflictException(
        'Cannot remove vehicle with planned or in-progress trips',
      );
    }

    await this.trackerRepository.update(
      { vehicle_id: id },
      { vehicle_id: undefined },
    );

    await this.tripRepository.update(
      { vehicle_id: id },
      { vehicle_id: undefined },
    );

    await this.vehicleRepository.remove(vehicle);
  }
}
