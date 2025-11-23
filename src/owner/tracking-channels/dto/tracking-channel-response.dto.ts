import { ApiProperty } from '@nestjs/swagger';

export class TrackingChannelResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  publicToken: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  assigned_trip_id: number | null;
}
