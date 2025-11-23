import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CurrentTelemetryDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  speed?: number;

  @ApiProperty()
  datetime: Date;

  @ApiPropertyOptional()
  temperature?: number;

  @ApiPropertyOptional()
  humidity?: number;
}
