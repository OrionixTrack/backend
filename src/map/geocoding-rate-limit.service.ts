import { InjectRedis } from '@nestjs-modules/ioredis';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { GEOCODING_RATE_LIMIT } from './geocoding.constants';

type GeocodingOperation = 'search' | 'reverse';

@Injectable()
export class GeocodingRateLimitService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async ensureWithinLimit(
    userId: number,
    operation: GeocodingOperation,
  ): Promise<void> {
    const limit =
      operation === 'search'
        ? GEOCODING_RATE_LIMIT.SEARCH_REQUESTS_PER_WINDOW
        : GEOCODING_RATE_LIMIT.REVERSE_REQUESTS_PER_WINDOW;

    const currentBucket = Math.floor(
      Date.now() / (GEOCODING_RATE_LIMIT.WINDOW_SECONDS * 1000),
    );

    const key = `geocoding:rate:${operation}:${userId}:${currentBucket}`;
    const currentCount = await this.redis.incr(key);

    if (currentCount === 1) {
      await this.redis.expire(key, GEOCODING_RATE_LIMIT.WINDOW_SECONDS + 5);
    }

    if (currentCount > limit) {
      throw new HttpException(
        'Geocoding rate limit exceeded for this user. Please retry in a minute.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
