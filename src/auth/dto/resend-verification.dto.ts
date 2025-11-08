import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address to resend the verification email to',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;
}
