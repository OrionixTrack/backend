import { ApiProperty } from '@nestjs/swagger';
import { DispatcherUserDto } from './dispatcher-user.dto';

export class DispatcherAuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Dispatcher user details',
    type: DispatcherUserDto,
  })
  dispatcher: DispatcherUserDto;
}
