import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { TrackingChannel, Trip } from '../../common/entities';
import { CreateTrackingChannelDto } from './dto/create-tracking-channel.dto';
import { UpdateTrackingChannelDto } from './dto/update-tracking-channel.dto';
import { TrackingChannelResponseDto } from './dto/tracking-channel-response.dto';
import { TrackingChannelMapper } from './tracking-channel.mapper';
import { TrackingChannelQueryDto } from './dto/tracking-channel-query.dto';

@Injectable()
export class TrackingChannelService {
  constructor(
    @InjectRepository(TrackingChannel)
    private trackingChannelRepository: Repository<TrackingChannel>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async findAll(
    companyId: number,
    query: TrackingChannelQueryDto,
  ): Promise<TrackingChannelResponseDto[]> {
    const qb = this.trackingChannelRepository
      .createQueryBuilder('channel')
      .where('channel.company_id = :companyId', { companyId });

    if (query.search) {
      qb.andWhere('channel.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    const channels = await qb
      .orderBy(`channel.${query.sortBy}`, query.sortOrder)
      .skip(query.offset)
      .take(query.limit)
      .getMany();

    return channels.map((channel) => TrackingChannelMapper.toDto(channel));
  }

  async findOne(
    id: number,
    companyId: number,
  ): Promise<TrackingChannelResponseDto> {
    const channel = await this.trackingChannelRepository.findOne({
      where: { tracking_channel_id: id, company_id: companyId },
    });

    if (!channel) {
      throw new NotFoundException('Tracking channel not found');
    }

    return TrackingChannelMapper.toDto(channel);
  }

  async create(
    companyId: number,
    createTrackingChannelDto: CreateTrackingChannelDto,
  ): Promise<TrackingChannelResponseDto> {
    if (createTrackingChannelDto.assigned_trip_id) {
      await this.validateTripAssignment(
        createTrackingChannelDto.assigned_trip_id,
        companyId,
      );
    }

    const channel = this.trackingChannelRepository.create({
      name: createTrackingChannelDto.name,
      assigned_trip_id: createTrackingChannelDto.assigned_trip_id,
      company_id: companyId,
      public_token: nanoid(),
    });

    const savedChannel = await this.trackingChannelRepository.save(channel);

    return TrackingChannelMapper.toDto(savedChannel);
  }

  async update(
    id: number,
    companyId: number,
    updateTrackingChannelDto: UpdateTrackingChannelDto,
  ): Promise<TrackingChannelResponseDto> {
    const channel = await this.trackingChannelRepository.findOne({
      where: { tracking_channel_id: id, company_id: companyId },
    });

    if (!channel) {
      throw new NotFoundException('Tracking channel not found');
    }

    if (
      updateTrackingChannelDto.assigned_trip_id !== undefined &&
      updateTrackingChannelDto.assigned_trip_id !== null
    ) {
      await this.validateTripAssignment(
        updateTrackingChannelDto.assigned_trip_id,
        companyId,
      );
    }

    channel.name = updateTrackingChannelDto.name;
    channel.assigned_trip_id =
      updateTrackingChannelDto.assigned_trip_id === undefined
        ? channel.assigned_trip_id
        : updateTrackingChannelDto.assigned_trip_id;

    const updatedChannel = await this.trackingChannelRepository.save(channel);

    return TrackingChannelMapper.toDto(updatedChannel);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const channel = await this.trackingChannelRepository.findOne({
      where: { tracking_channel_id: id, company_id: companyId },
    });

    if (!channel) {
      throw new NotFoundException('Tracking channel not found');
    }

    await this.trackingChannelRepository.remove(channel);
  }

  private async validateTripAssignment(
    tripId: number,
    companyId: number,
  ): Promise<void> {
    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: companyId },
    });

    if (!trip) {
      throw new BadRequestException(
        'Trip not found or does not belong to your company',
      );
    }
  }
}
