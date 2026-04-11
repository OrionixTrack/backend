import { ApiProperty } from '@nestjs/swagger';

export class GeocodeResultDto {
  @ApiProperty({ example: 'Khreshchatyk St, 1, Kyiv, Ukraine' })
  address: string;

  @ApiProperty({ example: 50.4501 })
  latitude: number;

  @ApiProperty({ example: 30.5234 })
  longitude: number;
}
