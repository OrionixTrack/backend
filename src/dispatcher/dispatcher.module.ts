import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatcherController } from './dispatcher.controller';
import { DispatcherService } from './dispatcher.service';
import { DispatcherTripController } from './dispatcher-trip.controller';
import { DispatcherTrackingChannelController } from './dispatcher-tracking-channel.controller';
import { DispatcherTrackingChannelService } from './dispatcher-tracking-channel.service';
import { Dispatcher, TrackingChannel, Trip } from '../common/entities';
import { TripModule } from '../trip/trip.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispatcher, TrackingChannel, Trip]),
    TripModule,
    RealtimeModule,
  ],
  controllers: [
    DispatcherController,
    DispatcherTripController,
    DispatcherTrackingChannelController,
  ],
  providers: [DispatcherService, DispatcherTrackingChannelService],
  exports: [DispatcherService],
})
export class DispatcherModule {}
