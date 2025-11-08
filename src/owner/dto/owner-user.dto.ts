import { ApiProperty } from '@nestjs/swagger';
import { CompanyDto } from '../../common/dto/company.dto';
import { UserLanguage } from '../../common/types/UserLanguage';

export class OwnerUserDto {
  @ApiProperty({
    description: 'Company owner ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Company owner email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the company owner',
    example: 'John Doe',
  })
  full_name: string;

  @ApiProperty({
    description: 'Preferred language of the user',
    enum: UserLanguage,
  })
  language: UserLanguage;

  @ApiProperty({
    description: 'Company',
    type: CompanyDto,
  })
  company: CompanyDto;
}
