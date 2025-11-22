import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'Delivery to Kyiv' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Delivery of electronics to warehouse' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-11-22T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  plannedStart?: string;

  @ApiPropertyOptional({ example: '+380991234567' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactInfo?: string;

  @ApiPropertyOptional({ example: 'Khreshchatyk St, 1, Kyiv' })
  @IsString()
  @IsOptional()
  startAddress?: string;

  @ApiPropertyOptional({ example: 50.4501 })
  @IsNumber()
  @IsOptional()
  startLatitude?: number;

  @ApiPropertyOptional({ example: 30.5234 })
  @IsNumber()
  @IsOptional()
  startLongitude?: number;

  @ApiProperty({ example: 'Peremohy Ave, 37, Kyiv' })
  @IsString()
  @IsNotEmpty()
  finishAddress: string;

  @ApiProperty({ example: 50.4547 })
  @IsNumber()
  finishLatitude: number;

  @ApiProperty({ example: 30.4454 })
  @IsNumber()
  finishLongitude: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  vehicleId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  driverId?: number;
}
