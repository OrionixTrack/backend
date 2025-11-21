import { Tracker } from '../../common/entities';
import { TrackerResponseDto } from './dto/tracker-response.dto';

export class TrackerMapper {
  static toDto(tracker: Tracker): TrackerResponseDto {
    return {
      id: tracker.tracker_id,
      name: tracker.name,
      device_secret_token: tracker.device_secret_token,
      vehicle_id: tracker.vehicle_id ?? null,
    };
  }
}
