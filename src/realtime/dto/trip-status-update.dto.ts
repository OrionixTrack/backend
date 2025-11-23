import { TripStatus } from '../../common/types/trip-status';

export class TripStatusUpdateDto {
  tripId: number;
  status: TripStatus;
}
