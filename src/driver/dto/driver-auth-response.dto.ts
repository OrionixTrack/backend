import { ApiProperty } from '@nestjs/swagger';
import { DriverUserDto } from './driver-user.dto';

export class DriverAuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Driver user details',
    type: DriverUserDto,
  })
  driver: DriverUserDto;
}
