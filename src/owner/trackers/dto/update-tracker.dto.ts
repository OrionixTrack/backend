import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTrackerDto {
  @ApiProperty({
    example: 'GPS Tracker #1',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 1,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsInt()
  vehicle_id?: number | null;
}
