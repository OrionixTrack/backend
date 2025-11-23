import { TripStatus } from '../../common/types/trip-status';

export interface ActiveVehicle {
  trip_id: number;
  trip_name: string;
  trip_status: TripStatus;
  start_address: string | null;
  finish_address: string;
  finish_latitude: string;
  finish_longitude: string;
  vehicle_id: number;
  vehicle_name: string;
  license_plate: string;
  latitude: string | null;
  longitude: string | null;
  speed: string | null;
  datetime: Date | null;
}
