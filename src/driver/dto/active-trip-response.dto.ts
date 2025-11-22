import { ApiProperty } from '@nestjs/swagger';
import { TripResponseDto } from '../../trip/dto/trip-response.dto';

export class ActiveTripResponseDto {
  @ApiProperty({ type: TripResponseDto, nullable: true })
  activeTrip: TripResponseDto | null;
}
