import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TripStatus } from '../../common/types/trip-status';
import { Transform } from 'class-transformer';

export enum TripSortField {
  START_DATE = 'planned_start_datetime',
  CREATED_AT = 'trip_id',
  STATUS = 'status',
}

export class TripQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: TripSortField,
    default: TripSortField.START_DATE,
  })
  @IsEnum(TripSortField)
  @IsOptional()
  sortBy?: TripSortField = TripSortField.START_DATE;

  @ApiPropertyOptional({
    enum: TripStatus,
    example: TripStatus.COMPLETED,
  })
  @IsEnum(TripStatus)
  @IsOptional()
  status?: TripStatus;

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

  @ApiPropertyOptional({
    description: 'Filter trips created by current dispatcher',
    default: false,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  createdByMe?: boolean = false;
}
