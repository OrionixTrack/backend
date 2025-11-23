import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '../../common/types/trip-status';

export class MapVehicleTripDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: TripStatus })
  status: TripStatus;

  @ApiPropertyOptional()
  startAddress?: string;

  @ApiProperty()
  finishAddress: string;

  @ApiProperty()
  finishLatitude: number;

  @ApiProperty()
  finishLongitude: number;
}
