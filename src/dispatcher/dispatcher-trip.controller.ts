import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TripService } from '../trip/trip.service';
import { TripResponseDto } from '../trip/dto/trip-response.dto';
import { CreateTripDto } from '../trip/dto/create-trip.dto';
import { UpdateTripDto } from '../trip/dto/update-trip.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { AssignVehicleDto } from './dto/assign-vehicle.dto';
import { DispatcherTripQueryDto } from '../trip/dto/dispatcher-trip-query.dto';

@ApiTags('Dispatcher - Trips')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.DISPATCHER)
@Controller('dispatcher/trips')
export class DispatcherTripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all trips with filtering',
  })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() query: DispatcherTripQueryDto,
  ): Promise<TripResponseDto[]> {
    return this.tripService.findAll(user.companyId, query, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip details with track path' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new trip (plan trip)' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateTripDto,
  ): Promise<TripResponseDto> {
    return this.tripService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update trip details (only planned trips)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateTripDto,
  ): Promise<TripResponseDto> {
    return this.tripService.update(id, user.companyId, dto);
  }

  @Put(':id/assign-driver')
  @ApiOperation({ summary: 'Assign or unassign driver (only planned trips)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async assignDriver(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: AssignDriverDto,
  ): Promise<TripResponseDto> {
    return this.tripService.assignDriver(
      id,
      user.companyId,
      dto.driverId ?? null,
    );
  }

  @Put(':id/assign-vehicle')
  @ApiOperation({ summary: 'Assign or unassign vehicle (only planned trips)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async assignVehicle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: AssignVehicleDto,
  ): Promise<TripResponseDto> {
    return this.tripService.assignVehicle(
      id,
      user.companyId,
      dto.vehicleId ?? null,
    );
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a planned trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({
    status: 400,
    description: 'Vehicle must be assigned before starting',
  })
  async startTrip(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.startTrip(id, user.companyId);
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End an in-progress trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async endTrip(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.endTrip(id, user.companyId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a trip (planned or in-progress)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async cancelTrip(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.cancelTrip(id, user.companyId);
  }
}
