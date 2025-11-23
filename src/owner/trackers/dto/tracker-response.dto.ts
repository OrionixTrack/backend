import { ApiProperty } from '@nestjs/swagger';

export class TrackerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    example: 5,
    nullable: true,
  })
  vehicle_id: number | null;
}

export class TrackerWithTokenResponseDto extends TrackerResponseDto {
  @ApiProperty({
    description:
      'Device secret token. Only shown once on create or regenerate.',
    example: 'a1b2c3d4e5f6...',
  })
  device_secret_token: string;
}
