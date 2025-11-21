import { ApiProperty } from '@nestjs/swagger';

export class TripVehicleDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  licensePlate: string;
  @ApiProperty()
  brand: string;
  @ApiProperty()
  model: string;
}
