import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicTripInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  finishAddress?: string;

  @ApiPropertyOptional()
  finishLatitude?: number;

  @ApiPropertyOptional()
  finishLongitude?: number;
}
