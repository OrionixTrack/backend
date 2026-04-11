import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReverseGeocodeQueryDto {
  @ApiProperty({ example: 50.4501 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: 30.5234 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;

  @ApiPropertyOptional({ example: 18, minimum: 3, maximum: 18 })
  @Type(() => Number)
  @IsNumber()
  @Min(3)
  @Max(18)
  @IsOptional()
  zoom?: number;

  @ApiPropertyOptional({ example: 'uk' })
  @IsString()
  @IsOptional()
  acceptLanguage?: string;
}
