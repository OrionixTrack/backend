import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { TripQueryDto } from './trip-query.dto';

export class DispatcherTripQueryDto extends TripQueryDto {
  @ApiPropertyOptional({
    description: 'Filter trips created by current dispatcher',
    default: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  createdByMe?: boolean = false;
}
