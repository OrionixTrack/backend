import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class AssignVehicleDto {
  @ApiProperty({ example: 1, nullable: true })
  @IsInt()
  @IsOptional()
  vehicleId?: number | null;
}
