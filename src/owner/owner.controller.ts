import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OwnerService } from './owner.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnerUserDto } from './dto/owner-user.dto';

@ApiTags('Owner')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('profile')
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: 'Get current Company Owner profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current authenticated owner profile',
    type: OwnerUserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have the correct role',
  })
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OwnerUserDto> {
    return this.ownerService.getProfile(user.userId);
  }
}
