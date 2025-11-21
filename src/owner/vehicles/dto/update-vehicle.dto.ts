import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiProperty({
    example: 'Truck #1',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'AA1234BB',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  license_plate: string;

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({
    example: 'Volvo',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({
    example: 'FH16',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiProperty({
    example: 2022,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  production_year?: number;

  @ApiProperty({
    example: 20.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;
}
