import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingChannel, Trip } from '../common/entities';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { UserRole } from '../auth/types/user-role.enum';
import { TripStatus } from '../common/types/trip-status';

type Result<T> = { success: true; data: T } | { success: false; error: string };

@Injectable()
export class RealtimeService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(TrackingChannel)
    private trackingChannelRepository: Repository<TrackingChannel>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async validateChannelSubscription(
    token: string,
  ): Promise<Result<{ channelId: number; tripId: number | null }>> {
    const channel = await this.trackingChannelRepository.findOne({
      where: { public_token: token },
    });

    if (!channel) {
      return { success: false, error: 'Channel not found' };
    }

    return {
      success: true,
      data: {
        channelId: channel.tracking_channel_id,
        tripId: channel.assigned_trip_id,
      },
    };
  }

  async validateTripSubscription(
    authToken: string,
    tripId: number,
  ): Promise<Result<{ tripId: number }>> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(authToken);
    } catch {
      return { success: false, error: 'Invalid token' };
    }

    if (
      payload.role !== UserRole.COMPANY_OWNER &&
      payload.role !== UserRole.DISPATCHER
    ) {
      return { success: false, error: 'Access denied' };
    }

    const trip = await this.tripRepository.findOne({
      where: { trip_id: tripId, company_id: payload.companyId },
    });

    if (!trip) {
      return { success: false, error: 'Trip not found' };
    }

    if (
      trip.status === TripStatus.COMPLETED ||
      trip.status === TripStatus.CANCELLED
    ) {
      return { success: false, error: 'Trip is not active' };
    }

    return { success: true, data: { tripId } };
  }
}
