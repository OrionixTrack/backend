import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmployeeManagementService } from './employee-management.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateOwnerProfileDto } from './dto/update-owner-profile.dto';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly employeeService: EmployeeManagementService) {}

  @Put('owner')
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: 'Update own profile (Company Owner)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Company Owner',
  })
  async updateOwnerProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() updateDto: UpdateOwnerProfileDto,
  ): Promise<{ message: string }> {
    return this.employeeService.updateOwnerProfile(
      user.userId,
      user.companyId,
      updateDto,
    );
  }

  @Put('driver')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Update own profile (Driver)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Driver',
  })
  async updateDriverProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() updateDto: UpdateEmployeeDto,
  ): Promise<{ message: string }> {
    return this.employeeService.updateDriverProfile(
      user.userId,
      user.companyId,
      updateDto,
    );
  }

  @Put('dispatcher')
  @Roles(UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Update own profile (Dispatcher)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Dispatcher',
  })
  async updateDispatcherProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() updateDto: UpdateEmployeeDto,
  ): Promise<{ message: string }> {
    return this.employeeService.updateDispatcherProfile(
      user.userId,
      user.companyId,
      updateDto,
    );
  }
}
