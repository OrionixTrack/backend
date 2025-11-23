import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingChannel, SensorData } from '../common/entities';
import { PublicChannelResponseDto } from './dto/public-channel-response.dto';
import { VehiclePositionDto } from './dto/vehicle-position.dto';

@Injectable()
export class PublicTrackingService {
  constructor(
    @InjectRepository(TrackingChannel)
    private trackingChannelRepository: Repository<TrackingChannel>,
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
  ) {}

  async getChannel(publicToken: string): Promise<PublicChannelResponseDto> {
    const channel = await this.trackingChannelRepository.findOne({
      where: { public_token: publicToken },
      relations: ['assignedTrip'],
    });

    if (!channel) {
      throw new NotFoundException('Tracking channel not found');
    }

    if (!channel.assignedTrip) {
      return {
        channelName: channel.name,
        trip: null,
        currentPosition: null,
      };
    }

    const currentPosition = await this.getLatestPosition(
      channel.assignedTrip.trip_id,
    );

    return {
      channelName: channel.name,
      trip: {
        name: channel.assignedTrip.name,
        status: channel.assignedTrip.status,
        finishAddress: channel.assignedTrip.finish_address,
        finishLatitude: channel.assignedTrip.finish_latitude
          ? Number(channel.assignedTrip.finish_latitude)
          : undefined,
        finishLongitude: channel.assignedTrip.finish_longitude
          ? Number(channel.assignedTrip.finish_longitude)
          : undefined,
      },
      currentPosition: currentPosition ?? null,
    };
  }

  private async getLatestPosition(
    tripId: number,
  ): Promise<VehiclePositionDto | null> {
    const latestSensorData = await this.sensorDataRepository.findOne({
      where: { trip_id: tripId },
      order: { datetime: 'DESC' },
    });

    if (!latestSensorData) {
      return null;
    }

    return {
      latitude: Number(latestSensorData.latitude),
      longitude: Number(latestSensorData.longitude),
      speed: latestSensorData.speed
        ? Number(latestSensorData.speed)
        : undefined,
      datetime: latestSensorData.datetime,
    };
  }
}
