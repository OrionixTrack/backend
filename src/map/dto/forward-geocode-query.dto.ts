import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const toOptionalBoolean = ({
  value,
}: {
  value: unknown;
}): boolean | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true' || value === '1') {
    return true;
  }

  if (value === false || value === 'false' || value === '0') {
    return false;
  }

  return value as boolean;
};

export class ForwardGeocodeQueryDto {
  @ApiPropertyOptional({ example: 'Khreshchatyk 1, Kyiv' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  amenity?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  county?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postalcode?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 40 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(40)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'ua,pl' })
  @IsString()
  @IsOptional()
  countrycodes?: string;

  @ApiPropertyOptional({ example: '30.3,50.3,30.8,50.6' })
  @IsString()
  @IsOptional()
  viewbox?: string;

  @ApiPropertyOptional({ example: true })
  @Transform(toOptionalBoolean)
  @IsBoolean()
  @IsOptional()
  bounded?: boolean;

  @ApiPropertyOptional({ example: true })
  @Transform(toOptionalBoolean)
  @IsBoolean()
  @IsOptional()
  dedupe?: boolean;

  @ApiPropertyOptional({ example: 'uk' })
  @IsString()
  @IsOptional()
  acceptLanguage?: string;
}
