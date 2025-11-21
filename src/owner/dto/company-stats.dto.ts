import { ApiProperty } from '@nestjs/swagger';

class TripStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  planned: number;

  @ApiProperty()
  inProgress: number;

  @ApiProperty()
  completed: number;

  @ApiProperty()
  cancelled: number;
}

export class CompanyStatsDto {
  @ApiProperty()
  driversCount: number;

  @ApiProperty()
  dispatchersCount: number;

  @ApiProperty()
  vehiclesCount: number;

  @ApiProperty()
  trackersCount: number;

  @ApiProperty()
  trips: TripStatsDto;
}
