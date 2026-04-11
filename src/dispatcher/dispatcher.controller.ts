import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DispatcherService } from './dispatcher.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DispatcherUserDto } from './dto/dispatcher-user.dto';
import { VehicleService } from '../owner/vehicles/vehicle.service';
import { VehicleQueryDto } from '../owner/vehicles/dto/vehicle-query.dto';
import { VehicleResponseDto } from '../owner/vehicles/dto/vehicle-response.dto';
import { EmployeeManagementService } from '../owner/employees/employee-management.service';
import { EmployeeQueryDto } from '../owner/employees/dto/employee-query.dto';
import { EmployeeResponseDto } from '../owner/employees/dto/employee-response.dto';

@ApiTags('Dispatcher')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('dispatcher')
export class DispatcherController {
  constructor(
    private readonly dispatcherService: DispatcherService,
    private readonly vehicleService: VehicleService,
    private readonly employeeManagementService: EmployeeManagementService,
  ) {}

  @Get('profile')
  @Roles(UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Get current Dispatcher profile' })
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<DispatcherUserDto> {
    return this.dispatcherService.getProfile(user.userId);
  }

  @Get('vehicles')
  @Roles(UserRole.DISPATCHER)
  @ApiOperation({
    summary: 'Get all company vehicles with pagination, search, and sorting',
  })
  async getVehicles(
    @CurrentUser() user: CurrentUserData,
    @Query() query: VehicleQueryDto,
  ): Promise<VehicleResponseDto[]> {
    return this.vehicleService.findAll(user.companyId, query);
  }

  @Get('drivers')
  @Roles(UserRole.DISPATCHER)
  @ApiOperation({
    summary: 'Get all company drivers with pagination, search, and sorting',
  })
  async getDrivers(
    @CurrentUser() user: CurrentUserData,
    @Query() query: EmployeeQueryDto,
  ): Promise<EmployeeResponseDto[]> {
    return this.employeeManagementService.getDriversByCompany(
      user.companyId,
      query,
    );
  }
}
