import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingChannel, Trip } from '../common/entities';
import { TrackingChannelResponseDto } from '../owner/tracking-channels/dto/tracking-channel-response.dto';
import { TrackingChannelMapper } from '../owner/tracking-channels/tracking-channel.mapper';

@Injectable()
export class DispatcherTrackingChannelService {
  constructor(
    @InjectRepository(TrackingChannel)
    private trackingChannelRepository: Repository<TrackingChannel>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async findAll(companyId: number): Promise<TrackingChannelResponseDto[]> {
    const channels = await this.trackingChannelRepository.find({
      where: { company_id: companyId },
      order: { tracking_channel_id: 'ASC' },
    });

    return channels.map((channel) => TrackingChannelMapper.toDto(channel));
  }

  async findOne(
    channelId: number,
    companyId: number,
  ): Promise<TrackingChannelResponseDto> {
    const channel = await this.trackingChannelRepository.findOne({
      where: { tracking_channel_id: channelId, company_id: companyId },
    });

    if (!channel) {
      throw new NotFoundException('Tracking channel not found');
    }

    return TrackingChannelMapper.toDto(channel);
  }

  async assignTrip(
    channelId: number,
    companyId: number,
    tripId: number | null,
  ): Promise<TrackingChannelResponseDto> {
    const channel = await this.trackingChannelRepository.findOne({
      where: { tracking_channel_id: channelId, company_id: companyId },
    });

    if (!channel) {
      throw new NotFoundException('Tracking channel not found');
    }

    if (tripId !== null) {
      const trip = await this.tripRepository.findOne({
        where: { trip_id: tripId, company_id: companyId },
      });

      if (!trip) {
        throw new BadRequestException(
          'Trip not found or does not belong to your company',
        );
      }
    }

    channel.assigned_trip_id = tripId;
    const updatedChannel = await this.trackingChannelRepository.save(channel);

    return TrackingChannelMapper.toDto(updatedChannel);
  }
}
