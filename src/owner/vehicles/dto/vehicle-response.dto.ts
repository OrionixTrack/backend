import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  license_plate: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  brand: string | null;

  @ApiProperty()
  model: string | null;

  @ApiProperty()
  production_year: number | null;

  @ApiProperty()
  capacity: number | null;

  @ApiProperty()
  tracker_id: number | null;
}
