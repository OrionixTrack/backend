import { ApiProperty } from '@nestjs/swagger';
import { EmployeeRole } from '../../../common/types/employee-role';
import { InvitationStatus } from '../../../common/types/invitation-status';

export class InvitationResponseDto {
  @ApiProperty({
    description: 'Invitation ID',
    example: 1,
  })
  invitation_id: number;

  @ApiProperty({
    description: 'Email address',
    example: 'employee@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Employee role',
    enum: EmployeeRole,
    example: EmployeeRole.DRIVER,
  })
  role: EmployeeRole;

  @ApiProperty({
    description: 'Invitation status',
    enum: InvitationStatus,
    example: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @ApiProperty({
    description: 'Expiration date',
    example: '2025-11-13T14:30:00Z',
  })
  expires_at: Date;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-11-12T14:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Acceptance date (if accepted)',
    example: '2025-11-12T15:30:00Z',
    nullable: true,
  })
  accepted_at: Date | null;
}
