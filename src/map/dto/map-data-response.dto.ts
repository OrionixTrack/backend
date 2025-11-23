import { ApiProperty } from '@nestjs/swagger';
import { MapVehicleDto } from './map-vehicle.dto';

export class MapDataResponseDto {
  @ApiProperty({ type: [MapVehicleDto] })
  vehicles: MapVehicleDto[];
}
