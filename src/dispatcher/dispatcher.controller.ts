import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DispatcherService } from './dispatcher.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DispatcherUserDto } from './dto/dispatcher-user.dto';

@ApiTags('Dispatcher')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('dispatcher')
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) {}

  @Get('profile')
  @Roles(UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Get current Dispatcher profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current authenticated dispatcher profile',
    type: DispatcherUserDto,
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
  ): Promise<DispatcherUserDto> {
    return this.dispatcherService.getProfile(user.userId);
  }
}
