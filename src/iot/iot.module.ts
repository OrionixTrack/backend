import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracker, SensorData, Trip, Vehicle } from '../common/entities';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { MqttClientService } from './mqtt-client.service';
import { TelemetryCacheService } from './telemetry-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tracker, SensorData, Trip, Vehicle])],
  controllers: [IotController],
  providers: [IotService, MqttClientService, TelemetryCacheService],
  exports: [IotService, MqttClientService, TelemetryCacheService],
})
export class IotModule {}
