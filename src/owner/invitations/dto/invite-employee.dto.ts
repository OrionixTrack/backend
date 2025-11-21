import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeRole } from '../../../common/types/employee-role';

export class InviteEmployeeDto {
  @ApiProperty({
    description: 'Email address of the employee to invite',
    example: 'employee@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role of the employee',
    enum: EmployeeRole,
    example: EmployeeRole.DRIVER,
  })
  @IsEnum(EmployeeRole)
  @IsNotEmpty()
  role: EmployeeRole;
}
