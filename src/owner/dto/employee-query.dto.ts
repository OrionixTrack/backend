import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum EmployeeSortField {
  NAME = 'name',
  SURNAME = 'surname',
  EMAIL = 'email',
  REGISTER_DATE = 'register_date',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class EmployeeQueryDto {
  @ApiProperty({
    description: 'Number of items to return',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Number of items to skip',
    example: 0,
    required: false,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Search query (searches in name, surname, and email)',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    enum: EmployeeSortField,
    example: EmployeeSortField.REGISTER_DATE,
    required: false,
    default: EmployeeSortField.REGISTER_DATE,
  })
  @IsOptional()
  @IsEnum(EmployeeSortField)
  sortBy?: EmployeeSortField = EmployeeSortField.REGISTER_DATE;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
    required: false,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
