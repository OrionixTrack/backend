import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export enum EmployeeSortField {
  NAME = 'name',
  SURNAME = 'surname',
  EMAIL = 'email',
  REGISTER_DATE = 'register_date',
}

export class EmployeeQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: EmployeeSortField,
    default: EmployeeSortField.REGISTER_DATE,
  })
  @IsEnum(EmployeeSortField)
  @IsOptional()
  sortBy?: EmployeeSortField = EmployeeSortField.REGISTER_DATE;
}
