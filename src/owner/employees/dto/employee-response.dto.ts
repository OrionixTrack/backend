import { ApiProperty } from '@nestjs/swagger';
import { UserLanguage } from '../../../common/types/UserLanguage';

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  name: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  surname: string;

  @ApiProperty({
    description: 'Email address',
    example: 'employee@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Registration date',
    example: '2025-11-12T14:30:00Z',
  })
  register_date: Date;

  @ApiProperty({
    description: 'Preferred language',
    enum: UserLanguage,
    example: UserLanguage.ENGLISH,
  })
  language: UserLanguage;
}
