import { ApiProperty } from '@nestjs/swagger';

export class TrackerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  device_secret_token: string;

  @ApiProperty({
    example: 5,
    nullable: true,
  })
  vehicle_id: number | null;
}
