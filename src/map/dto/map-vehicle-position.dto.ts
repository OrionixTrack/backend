import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MapVehiclePositionDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  speed?: number;

  @ApiProperty()
  datetime: Date;
}
