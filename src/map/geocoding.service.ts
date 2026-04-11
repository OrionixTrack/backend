import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ForwardGeocodeQueryDto,
  ForwardGeocodeResponseDto,
  GeocodeResultDto,
  ReverseGeocodeQueryDto,
} from './dto';
import { GeocodingCacheService } from './geocoding-cache.service';
import { GEOCODING_CACHE_TTL_SECONDS } from './geocoding.constants';
import { GeocodingMapper } from './geocoding.mapper';
import { GeocodingRateLimitService } from './geocoding-rate-limit.service';
import { MapsCoGeocodingClient } from './maps-co-geocoding.client';

@Injectable()
export class GeocodingService {
  constructor(
    private readonly geocodingCacheService: GeocodingCacheService,
    private readonly geocodingRateLimitService: GeocodingRateLimitService,
    private readonly mapsCoGeocodingClient: MapsCoGeocodingClient,
  ) {}

  async search(
    userId: number,
    query: ForwardGeocodeQueryDto,
  ): Promise<ForwardGeocodeResponseDto> {
    this.ensureForwardQuery(query);
    await this.geocodingRateLimitService.ensureWithinLimit(userId, 'search');

    const cached = await this.geocodingCacheService.get<GeocodeResultDto[]>(
      'search',
      query,
    );

    if (cached) {
      return { results: cached };
    }

    const upstreamResults = await this.mapsCoGeocodingClient.search(query);
    const results = upstreamResults.map((result) =>
      GeocodingMapper.toResultDto(result),
    );

    await this.geocodingCacheService.set(
      'search',
      query,
      GEOCODING_CACHE_TTL_SECONDS.SEARCH,
      results,
    );

    return { results };
  }

  async reverse(
    userId: number,
    query: ReverseGeocodeQueryDto,
  ): Promise<GeocodeResultDto> {
    await this.geocodingRateLimitService.ensureWithinLimit(userId, 'reverse');

    const cached = await this.geocodingCacheService.get<GeocodeResultDto>(
      'reverse',
      query,
    );

    if (cached) {
      return cached;
    }

    const upstreamResult = await this.mapsCoGeocodingClient.reverse(query);
    const result = GeocodingMapper.toResultDto(upstreamResult);

    await this.geocodingCacheService.set(
      'reverse',
      query,
      GEOCODING_CACHE_TTL_SECONDS.REVERSE,
      result,
    );

    return result;
  }

  private ensureForwardQuery(query: ForwardGeocodeQueryDto): void {
    const hasFreeFormQuery = Boolean(query.q?.trim());
    const hasStructuredQuery = [
      query.amenity,
      query.street,
      query.city,
      query.county,
      query.state,
      query.country,
      query.postalcode,
    ].some((value) => Boolean(value?.trim()));

    if (!hasFreeFormQuery && !hasStructuredQuery) {
      throw new BadRequestException(
        'Either q or at least one structured address field must be provided.',
      );
    }
  }
}
