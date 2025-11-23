import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingChannel, SensorData } from '../common/entities';
import { PublicTrackingController } from './public-tracking.controller';
import { PublicTrackingService } from './public-tracking.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingChannel, SensorData])],
  controllers: [PublicTrackingController],
  providers: [PublicTrackingService],
})
export class PublicModule {}
