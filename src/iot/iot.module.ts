import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Tracker,
  SensorData,
  Trip,
  Vehicle,
  TrackingChannel,
} from '../common/entities';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { MqttClientService } from './mqtt-client.service';
import { TelemetryCacheService } from './telemetry-cache.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tracker,
      SensorData,
      Trip,
      Vehicle,
      TrackingChannel,
    ]),
    forwardRef(() => RealtimeModule),
  ],
  controllers: [IotController],
  providers: [IotService, MqttClientService, TelemetryCacheService],
  exports: [IotService, MqttClientService, TelemetryCacheService],
})
export class IotModule {}
