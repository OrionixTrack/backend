import { ApiProperty } from '@nestjs/swagger';
import { GeocodeResultDto } from './geocode-result.dto';

export class ForwardGeocodeResponseDto {
  @ApiProperty({ type: [GeocodeResultDto] })
  results: GeocodeResultDto[];
}
