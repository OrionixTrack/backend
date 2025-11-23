import { Tracker } from '../../common/entities';
import {
  TrackerResponseDto,
  TrackerWithTokenResponseDto,
} from './dto/tracker-response.dto';

export class TrackerMapper {
  static toDto(tracker: Tracker): TrackerResponseDto {
    return {
      id: tracker.tracker_id,
      name: tracker.name,
      vehicle_id: tracker.vehicle_id ?? null,
    };
  }

  static toDtoWithToken(
    tracker: Tracker,
    plainToken: string,
  ): TrackerWithTokenResponseDto {
    return {
      ...this.toDto(tracker),
      device_secret_token: plainToken,
    };
  }
}
