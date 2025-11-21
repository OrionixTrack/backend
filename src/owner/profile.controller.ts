import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateOwnerProfileDto } from './dto/update-owner-profile.dto';
import { EmployeeManagementService } from './employees/employee-management.service';
import { UpdateEmployeeDto } from './employees/dto/update-employee.dto';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly employeeService: EmployeeManagementService) {}

  @Put('owner')
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: 'Update own profile (Company Owner)' })
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
