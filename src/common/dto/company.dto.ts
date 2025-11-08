import { ApiProperty } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty({
    description: 'Company ID',
    example: 5,
  })
  id: number;

  @ApiProperty({
    description: 'Company name',
    example: 'Fast Logistics Ltd.',
  })
  name: string;
}
