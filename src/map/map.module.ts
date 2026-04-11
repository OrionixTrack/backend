import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeocodingController } from './geocoding.controller';
import { GeocodingCacheService } from './geocoding-cache.service';
import { GeocodingRateLimitService } from './geocoding-rate-limit.service';
import { GeocodingService } from './geocoding.service';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { MapsCoGeocodingClient } from './maps-co-geocoding.client';
import { Trip } from '../common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  controllers: [MapController, GeocodingController],
  providers: [
    MapService,
    GeocodingService,
    GeocodingCacheService,
    GeocodingRateLimitService,
    MapsCoGeocodingClient,
  ],
  exports: [MapService],
})
export class MapModule {}
