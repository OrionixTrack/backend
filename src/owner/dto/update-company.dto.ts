import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Updated company name',
    example: 'New Company Name Ltd.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}
