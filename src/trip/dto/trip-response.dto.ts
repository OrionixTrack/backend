import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripUserDto } from './trip-user.dto';
import { TripVehicleDto } from './trip-vehicle.dto';
import { TripStatus } from '../../common/types/trip-status';

export class TripResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: TripStatus, example: TripStatus.PLANNED })
  status: TripStatus;

  @ApiProperty()
  plannedStart?: Date;

  @ApiPropertyOptional()
  actualStart?: Date;

  @ApiPropertyOptional()
  end?: Date;

  @ApiPropertyOptional()
  contactInfo?: string;

  @ApiProperty()
  startAddress?: string;

  @ApiProperty()
  finishAddress: string;

  @ApiProperty()
  startLatitude: number;

  @ApiProperty()
  startLongitude: number;

  @ApiProperty()
  finishLatitude: number;

  @ApiProperty()
  finishLongitude: number;

  @ApiPropertyOptional({ type: TripUserDto })
  driver?: TripUserDto;

  @ApiPropertyOptional({ type: TripVehicleDto })
  vehicle?: TripVehicleDto;

  @ApiPropertyOptional({ type: TripUserDto })
  createdByDispatcher?: TripUserDto;

  @ApiPropertyOptional({
    nullable: true,
  })
  trackPolyline?: string | undefined;
}
