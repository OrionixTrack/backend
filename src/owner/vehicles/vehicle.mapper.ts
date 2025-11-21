import { Vehicle } from '../../common/entities';
import { VehicleResponseDto } from './dto/vehicle-response.dto';

export class VehicleMapper {
  static toDto(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.vehicle_id,
      name: vehicle.name,
      license_plate: vehicle.license_plate,
      is_active: vehicle.is_active,
      brand: vehicle.brand ?? null,
      model: vehicle.model ?? null,
      production_year: vehicle.production_year ?? null,
      capacity: vehicle.capacity ? Number(vehicle.capacity) : null,
      tracker_id: vehicle.tracker?.tracker_id ?? null,
    };
  }
}
