import { TripResponseDto } from './dto/trip-response.dto';
import { Trip } from '../common/entities';

export class TripMapper {
  static toDto(
    trip: Trip,
    trackPolyline: string | null = null,
  ): TripResponseDto {
    return {
      id: trip.trip_id,
      name: trip.name,
      description: trip.description,
      status: trip.status,
      plannedStart: trip.planned_start_datetime,
      actualStart: trip.actual_start_datetime,
      end: trip.end_datetime,
      contactInfo: trip.contact_info,
      startAddress: trip.start_address,
      finishAddress: trip.finish_address,
      startLatitude: Number(trip.start_latitude),
      startLongitude: Number(trip.start_longitude),
      finishLatitude: Number(trip.finish_latitude),
      finishLongitude: Number(trip.finish_longitude),
      driver: trip.assignedDriver
        ? {
            id: trip.assignedDriver.driver_id,
            name: trip.assignedDriver.name,
            surname: trip.assignedDriver.surname,
          }
        : undefined,
      vehicle: trip.vehicle
        ? {
            id: trip.vehicle.vehicle_id,
            name: trip.vehicle.name,
            licensePlate: trip.vehicle.license_plate,
            brand: trip.vehicle.brand ?? '',
            model: trip.vehicle.model ?? '',
          }
        : undefined,
      createdByDispatcher: trip.createdByDispatcher
        ? {
            id: trip.createdByDispatcher.dispatcher_id,
            name: trip.createdByDispatcher.name,
            surname: trip.createdByDispatcher.surname,
          }
        : undefined,
      trackPolyline: trackPolyline || undefined,
    };
  }
}
