import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserLanguage } from '../../common/types/UserLanguage';

export class UpdateOwnerProfileDto {
  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  full_name?: string;

  @ApiProperty({
    description: 'Preferred language',
    enum: UserLanguage,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserLanguage)
  language?: UserLanguage;
}
