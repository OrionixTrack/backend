import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEYS, REDIS_TTL_SECONDS } from './iot.constants';
import { CachedTripMapping } from './types/cached-trip-mapping';

@Injectable()
export class TelemetryCacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setTripMapping(
    trackerId: number,
    mapping: CachedTripMapping,
  ): Promise<void> {
    const key = REDIS_KEYS.TRACKER_TRIP(trackerId);
    await this.redis.setex(
      key,
      REDIS_TTL_SECONDS.TRIP_MAPPING,
      JSON.stringify(mapping),
    );
  }

  async getTripMapping(trackerId: number): Promise<CachedTripMapping | null> {
    const key = REDIS_KEYS.TRACKER_TRIP(trackerId);
    const data = await this.redis.get(key);
    return data ? (JSON.parse(data) as CachedTripMapping) : null;
  }

  async invalidateTripMapping(trackerId: number): Promise<void> {
    const key = REDIS_KEYS.TRACKER_TRIP(trackerId);
    await this.redis.del(key);
  }
}
