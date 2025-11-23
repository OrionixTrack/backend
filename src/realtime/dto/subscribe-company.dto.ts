import { IsInt, IsPositive } from 'class-validator';

export class SubscribeCompanyDto {
  @IsInt()
  @IsPositive()
  companyId: number;
}
