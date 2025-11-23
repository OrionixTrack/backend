import { ApiProperty } from '@nestjs/swagger';
import { PublicTripInfoDto } from './public-trip-info.dto';
import { VehiclePositionDto } from './vehicle-position.dto';

export class PublicChannelResponseDto {
  @ApiProperty()
  channelName: string;

  @ApiProperty({ type: PublicTripInfoDto, nullable: true })
  trip: PublicTripInfoDto | null;

  @ApiProperty({ type: VehiclePositionDto, nullable: true })
  currentPosition: VehiclePositionDto | null;
}
