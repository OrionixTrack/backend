import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export enum VehicleSortField {
  NAME = 'name',
  LICENSE_PLATE = 'license_plate',
  BRAND = 'brand',
  YEAR = 'production_year',
}

export class VehicleQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: VehicleSortField,
    default: VehicleSortField.NAME,
  })
  @IsEnum(VehicleSortField)
  @IsOptional()
  sortBy?: VehicleSortField = VehicleSortField.NAME;
}
