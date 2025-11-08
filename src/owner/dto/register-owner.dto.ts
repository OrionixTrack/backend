import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserLanguage } from '../../common/types/UserLanguage';

export class RegisterOwnerDto {
  @ApiProperty({
    description: 'Full name of the company owner',
    example: 'John Doe',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Email address for the owner account',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the owner account (minimum 8 characters)',
    example: '12345678',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Name of the company being registered',
    example: 'Acme Transport Inc.',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @ApiProperty({
    description: 'Preferred language of the user',
    enum: UserLanguage,
    default: UserLanguage.ENGLISH,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserLanguage)
  language?: UserLanguage;
}
