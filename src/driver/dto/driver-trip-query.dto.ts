import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TripSortField } from '../../trip/dto/trip-query.dto';

export class DriverTripQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: TripSortField,
    default: TripSortField.START_DATE,
  })
  @IsEnum(TripSortField)
  @IsOptional()
  sortBy?: TripSortField = TripSortField.START_DATE;

  @ApiPropertyOptional({
    example: '2025-11-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2025-11-30T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
