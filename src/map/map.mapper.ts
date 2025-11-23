import { MapVehicleDto, MapVehiclePositionDto, MapVehicleTripDto } from './dto';
import { ActiveVehicle } from './types/active-vehicle';

export class MapMapper {
  static toVehicleDto(vehicle: ActiveVehicle): MapVehicleDto {
    return {
      vehicleId: vehicle.vehicle_id,
      vehicleName: vehicle.vehicle_name,
      licensePlate: vehicle.license_plate,
      activeTrip: this.toTripDto(vehicle),
      position: vehicle.latitude ? this.toPositionDto(vehicle) : undefined,
    };
  }

  static toTripDto(vehicle: ActiveVehicle): MapVehicleTripDto {
    return {
      id: vehicle.trip_id,
      name: vehicle.trip_name,
      status: vehicle.trip_status,
      startAddress: vehicle.start_address ?? undefined,
      finishAddress: vehicle.finish_address,
      finishLatitude: Number(vehicle.finish_latitude),
      finishLongitude: Number(vehicle.finish_longitude),
    };
  }

  static toPositionDto(vehicle: ActiveVehicle): MapVehiclePositionDto {
    return {
      latitude: Number(vehicle.latitude),
      longitude: Number(vehicle.longitude),
      speed: vehicle.speed ? Number(vehicle.speed) : undefined,
      datetime: vehicle.datetime!,
    };
  }
}
