import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { createHash } from 'crypto';

@Injectable()
export class GeocodingCacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T>(namespace: string, payload: object): Promise<T | null> {
    const cached = await this.redis.get(this.buildKey(namespace, payload));
    return cached ? (JSON.parse(cached) as T) : null;
  }

  async set<T>(
    namespace: string,
    payload: object,
    ttlSeconds: number,
    value: T,
  ): Promise<void> {
    await this.redis.setex(
      this.buildKey(namespace, payload),
      ttlSeconds,
      JSON.stringify(value),
    );
  }

  private buildKey(namespace: string, payload: object): string {
    const serializedPayload = JSON.stringify(
      Object.entries(payload)
        .filter(([, value]) => value !== undefined)
        .sort(([left], [right]) => left.localeCompare(right)),
    );

    const hash = createHash('sha256').update(serializedPayload).digest('hex');
    return `geocoding:cache:${namespace}:${hash}`;
  }
}
