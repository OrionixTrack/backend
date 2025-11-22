import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class AssignDriverDto {
  @ApiProperty({ example: 1, nullable: true })
  @IsInt()
  @IsOptional()
  driverId?: number | null;
}
