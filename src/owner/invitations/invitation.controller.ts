import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/types/user-role.enum';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';

@ApiTags('Invitations')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('owner/invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: 'Invite a new employee (Driver or Dispatcher)' })
  @ApiResponse({
    status: 409,
    description: 'Email already registered or invitation already sent',
  })
  async inviteEmployee(
    @CurrentUser() user: CurrentUserData,
    @Body() inviteDto: InviteEmployeeDto,
  ): Promise<InvitationResponseDto> {
    return this.invitationService.createInvitation(
      user.userId,
      user.companyId,
      inviteDto,
    );
  }

  @Get()
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: 'Get all invitations for the company' })
  async getInvitations(
    @CurrentUser() user: CurrentUserData,
  ): Promise<InvitationResponseDto[]> {
    return this.invitationService.getInvitationsByCompany(user.companyId);
  }
}
