import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ForwardGeocodeQueryDto, ReverseGeocodeQueryDto } from './dto';
import { MapsCoGeocodeResult } from './types/maps-co-geocoding';

@Injectable()
export class MapsCoGeocodingClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly requestTimeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('MAPS_CO_BASE_URL')!;
    this.apiKey = this.configService.get<string>('MAPS_CO_API_KEY')!;
    this.requestTimeoutMs = this.configService.get<number>(
      'GEOCODING_REQUEST_TIMEOUT_MS',
      5000,
    );
  }

  search(query: ForwardGeocodeQueryDto): Promise<MapsCoGeocodeResult[]> {
    return this.request<MapsCoGeocodeResult[]>(
      '/search',
      {
        q: query.q,
        amenity: query.amenity,
        street: query.street,
        city: query.city,
        county: query.county,
        state: query.state,
        country: query.country,
        postalcode: query.postalcode,
        limit: query.limit ?? 5,
        countrycodes: query.countrycodes,
        viewbox: query.viewbox,
        bounded: this.toApiBoolean(query.bounded),
        dedupe: this.toApiBoolean(query.dedupe),
        format: 'json',
      },
      query.acceptLanguage,
    );
  }

  reverse(query: ReverseGeocodeQueryDto): Promise<MapsCoGeocodeResult> {
    return this.request<MapsCoGeocodeResult>(
      '/reverse',
      {
        lat: query.lat,
        lon: query.lon,
        zoom: query.zoom,
        format: 'json',
      },
      query.acceptLanguage,
    );
  }

  private toApiBoolean(value?: boolean): 0 | 1 | undefined {
    if (value === undefined) {
      return undefined;
    }

    return value ? 1 : 0;
  }

  private async request<T>(
    pathname: string,
    query: Record<string, string | number | undefined>,
    acceptLanguage?: string,
  ): Promise<T> {
    const url = new URL(pathname, this.baseUrl);

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...(acceptLanguage ? { 'Accept-Language': acceptLanguage } : {}),
        },
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new ServiceUnavailableException(
            'Geocoding provider rate limit exceeded. Please retry later.',
          );
        }

        throw new BadGatewayException(
          `Geocoding provider request failed with status ${response.status}.`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Geocoding provider is temporarily unavailable.',
      );
    }
  }
}
