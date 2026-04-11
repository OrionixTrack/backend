import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehiclePositionDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  bearing?: number;

  @ApiPropertyOptional()
  speed?: number;

  @ApiProperty()
  datetime: Date;
}
