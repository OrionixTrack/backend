import { ApiProperty } from '@nestjs/swagger';
import { CompanyDto } from '../../common/dto/company.dto';
import { UserLanguage } from '../../common/types/UserLanguage';

export class DispatcherUserDto {
  @ApiProperty({
    description: 'Dispatcher ID',
    example: 5,
  })
  id: number;

  @ApiProperty({
    description: 'Dispatcher email',
    example: 'dispatcher@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the dispatcher',
    example: 'Jane',
  })
  name: string;

  @ApiProperty({
    description: 'Last name of the dispatcher',
    example: 'Smith',
  })
  surname: string;

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
