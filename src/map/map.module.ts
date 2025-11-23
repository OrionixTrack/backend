import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { Trip } from '../common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  controllers: [MapController],
  providers: [MapService],
  exports: [MapService],
})
export class MapModule {}
