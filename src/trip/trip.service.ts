import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as polyline from '@mapbox/polyline';
import { SensorData, Trip } from '../common/entities';
import { TripQueryDto } from './dto/trip-query.dto';
import { TripResponseDto } from './dto/trip-response.dto';
import { TripMapper } from './trip.mapper';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
  ) {}

  async findAllForOwner(
    companyId: number,
    query: TripQueryDto,
  ): Promise<TripResponseDto[]> {
    const qb = this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.assignedDriver', 'driver')
      .leftJoinAndSelect('trip.vehicle', 'vehicle')
      .where('trip.company_id = :companyId', { companyId });

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

  async findOneWithTrack(
    tripId: number,
    companyId: number,
  ): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
      relations: ['assignedDriver', 'vehicle', 'createdByDispatcher'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const sensorData = await this.sensorDataRepository.find({
      where: { trip_id: tripId },
      order: { datetime: 'ASC' },
      select: ['latitude', 'longitude'],
    });

    let trackPolyline: string | null = null;
    if (sensorData.length > 0) {
      const coordinates = sensorData.map(
        (point) =>
          [Number(point.latitude), Number(point.longitude)] as [number, number],
      );

      trackPolyline = polyline.encode(coordinates);
    }

    return TripMapper.toDto(trip, trackPolyline);
  }
}
