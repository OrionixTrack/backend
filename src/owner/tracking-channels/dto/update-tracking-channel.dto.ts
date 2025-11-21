import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTrackingChannelDto {
  @ApiProperty({
    example: 'Public Route Kyiv-Lviv',
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
  assigned_trip_id?: number | null;
}
