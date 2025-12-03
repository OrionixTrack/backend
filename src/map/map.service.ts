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
        COALESCE(sd.latitude, v.last_latitude::text) as latitude,
        COALESCE(sd.longitude, v.last_longitude::text) as longitude,
        COALESCE(sd.speed, v.last_speed::text) as speed,
        COALESCE(sd.bearing, v.last_bearing::text) as bearing,
        COALESCE(sd.datetime, v.last_update_time) as datetime
      FROM vehicle v
      LEFT JOIN trip t ON t.vehicle_id = v.vehicle_id AND t.status = $2
      LEFT JOIN LATERAL (
        SELECT latitude::text, longitude::text, speed::text, bearing::text, datetime
        FROM sensor_data
        WHERE trip_id = t.trip_id
        ORDER BY datetime DESC
        LIMIT 1
      ) sd ON true
      WHERE v.company_id = $1
        AND v.is_active = true
        AND (v.last_latitude IS NOT NULL OR sd.latitude IS NOT NULL)
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
