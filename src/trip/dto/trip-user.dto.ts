import { ApiProperty } from '@nestjs/swagger';

export class TripUserDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  surname: string;
}
