import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { EmployeeManagementService } from './employee-management.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { PaginatedEmployeeResponseDto } from './dto/paginated-employee-response.dto';

@ApiTags('Employee Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('owner/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeManagementService) {}

  @Get('drivers')
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({
    summary:
      'Get all drivers in the company with pagination, search, and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of drivers',
    type: PaginatedEmployeeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Company Owner',
  })
  async getDrivers(
    @CurrentUser() user: CurrentUserData,
    @Query() query: EmployeeQueryDto,
  ): Promise<PaginatedEmployeeResponseDto> {
    return this.employeeService.getDriversByCompany(user.companyId, query);
  }

  @Get('dispatchers')
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({
    summary:
      'Get all dispatchers in the company with pagination, search, and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of dispatchers',
    type: PaginatedEmployeeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Company Owner',
  })
  async getDispatchers(
    @CurrentUser() user: CurrentUserData,
    @Query() query: EmployeeQueryDto,
  ): Promise<PaginatedEmployeeResponseDto> {
    return this.employeeService.getDispatchersByCompany(user.companyId, query);
  }

  @Put('drivers/:id')
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: 'Update driver information' })
  @ApiParam({ name: 'id', description: 'Driver ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Driver updated successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Company Owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  async updateDriver(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) driverId: number,
    @Body() updateDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.updateDriver(
      driverId,
      user.companyId,
      updateDto,
    );
  }

  @Put('dispatchers/:id')
  @Roles(UserRole.COMPANY_OWNER)
  @ApiOperation({ summary: 'Update dispatcher information' })
  @ApiParam({ name: 'id', description: 'Dispatcher ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Dispatcher updated successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Company Owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Dispatcher not found',
  })
  async updateDispatcher(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) dispatcherId: number,
    @Body() updateDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.updateDispatcher(
      dispatcherId,
      user.companyId,
      updateDto,
    );
  }

  @Delete('drivers/:id')
  @Roles(UserRole.COMPANY_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove driver from company' })
  @ApiParam({ name: 'id', description: 'Driver ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Driver removed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Company Owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found',
  })
  async removeDriver(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) driverId: number,
  ): Promise<void> {
    await this.employeeService.removeDriver(driverId, user.companyId);
  }

  @Delete('dispatchers/:id')
  @Roles(UserRole.COMPANY_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove dispatcher from company' })
  @ApiParam({ name: 'id', description: 'Dispatcher ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Dispatcher removed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a Company Owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Dispatcher not found',
  })
  async removeDispatcher(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) dispatcherId: number,
  ): Promise<void> {
    await this.employeeService.removeDispatcher(dispatcherId, user.companyId);
  }
}
