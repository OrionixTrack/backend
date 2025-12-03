import { TripStatus } from '../../common/types/trip-status';

export interface ActiveVehicle {
  trip_id: number | null;
  trip_name: string | null;
  trip_status: TripStatus | null;
  start_address: string | null;
  finish_address: string | null;
  finish_latitude: string | null;
  finish_longitude: string | null;
  vehicle_id: number;
  vehicle_name: string;
  license_plate: string;
  latitude: string | null;
  longitude: string | null;
  speed: string | null;
  bearing: string | null;
  datetime: Date | null;
}
