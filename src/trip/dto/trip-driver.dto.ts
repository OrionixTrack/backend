import { ApiProperty } from '@nestjs/swagger';

export class TripDriverDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  surname: string;
}
