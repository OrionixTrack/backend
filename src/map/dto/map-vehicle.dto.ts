import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MapVehicleTripDto } from './map-vehicle-trip.dto';
import { MapVehiclePositionDto } from './map-vehicle-position.dto';

export class MapVehicleDto {
  @ApiProperty()
  vehicleId: number;

  @ApiProperty()
  vehicleName: string;

  @ApiProperty()
  licensePlate: string;

  @ApiPropertyOptional({ type: MapVehicleTripDto })
  activeTrip?: MapVehicleTripDto;

  @ApiPropertyOptional({ type: MapVehiclePositionDto })
  position?: MapVehiclePositionDto;
}
