import { GeocodeResultDto } from './dto';
import { MapsCoGeocodeResult } from './types/maps-co-geocoding';

export class GeocodingMapper {
  static toResultDto(result: MapsCoGeocodeResult): GeocodeResultDto {
    return {
      address: result.display_name,
      latitude: Number(result.lat),
      longitude: Number(result.lon),
    };
  }
}
