import { TrackingChannel } from '../../common/entities';
import { TrackingChannelResponseDto } from './dto/tracking-channel-response.dto';

export class TrackingChannelMapper {
  static toDto(channel: TrackingChannel): TrackingChannelResponseDto {
    return {
      id: channel.tracking_channel_id,
      publicToken: channel.public_token,
      name: channel.name,
      assigned_trip_id: channel.assigned_trip_id ?? null,
    };
  }
}
