import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DriverService } from './driver.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DriverUserDto } from './dto/driver-user.dto';

@ApiTags('Driver')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get('profile')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get current Driver profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current authenticated driver profile',
    type: DriverUserDto,
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
  ): Promise<DriverUserDto> {
    return this.driverService.getProfile(user.userId);
  }
}
