import { ApiProperty } from '@nestjs/swagger';
import { CompanyDto } from '../../common/dto/company.dto';
import { UserLanguage } from '../../common/types/UserLanguage';

export class DriverUserDto {
  @ApiProperty({
    description: 'Driver ID',
    example: 10,
  })
  id: number;

  @ApiProperty({
    description: 'Driver email',
    example: 'driver@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the driver',
    example: 'Mike',
  })
  name: string;

  @ApiProperty({
    description: 'Last name of the driver',
    example: 'Johnson',
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
