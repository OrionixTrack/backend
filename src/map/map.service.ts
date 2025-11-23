import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../common/entities';
import { TripStatus } from '../common/types/trip-status';
import { MapDataResponseDto } from './dto';
import { MapMapper } from './map.mapper';
import { ActiveVehicle } from './types/active-vehicle';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async getActiveVehicles(companyId: number): Promise<MapDataResponseDto> {
    const activeVehicles = await this.tripRepository.query<ActiveVehicle[]>(
      `
      SELECT
        t.trip_id,
        t.name as trip_name,
        t.status as trip_status,
        t.start_address,
        t.finish_address,
        t.finish_latitude,
        t.finish_longitude,
        v.vehicle_id,
        v.name as vehicle_name,
        v.license_plate,
        sd.latitude,
        sd.longitude,
        sd.speed,
        sd.datetime
      FROM trip t
      INNER JOIN vehicle v ON v.vehicle_id = t.vehicle_id
      LEFT JOIN LATERAL (
        SELECT latitude, longitude, speed, datetime
        FROM sensor_data
        WHERE trip_id = t.trip_id
        ORDER BY datetime DESC
        LIMIT 1
      ) sd ON true
      WHERE t.company_id = $1 AND t.status = $2
      `,
      [companyId, TripStatus.IN_PROGRESS],
    );

    return {
      vehicles: activeVehicles.map((vehicle) =>
        MapMapper.toVehicleDto(vehicle),
      ),
    };
  }
}
