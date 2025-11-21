import {
  IsNotEmpty,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserLanguage } from '../../../common/types/UserLanguage';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token from email',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'First name of the employee',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Last name of the employee',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  surname: string;

  @ApiProperty({
    description: 'Password for the account',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Preferred language',
    enum: UserLanguage,
    example: UserLanguage.ENGLISH,
  })
  @IsEnum(UserLanguage)
  @IsNotEmpty()
  language: UserLanguage;
}
