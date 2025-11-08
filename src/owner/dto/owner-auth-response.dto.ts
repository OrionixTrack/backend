import { ApiProperty } from '@nestjs/swagger';
import { OwnerUserDto } from './owner-user.dto';

export class OwnerAuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Company owner user details',
    type: OwnerUserDto,
  })
  owner: OwnerUserDto;
}
