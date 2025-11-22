import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { DriverService } from './driver.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DriverUserDto } from './dto/driver-user.dto';
import { TripService } from '../trip/trip.service';
import { TripResponseDto } from '../trip/dto/trip-response.dto';
import { DriverTripQueryDto } from './dto/driver-trip-query.dto';
import { ActiveTripResponseDto } from './dto/active-trip-response.dto';

@ApiTags('Driver')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly tripService: TripService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current Driver profile' })
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<DriverUserDto> {
    return this.driverService.getProfile(user.userId);
  }

  @Get('trips')
  @ApiOperation({ summary: 'Get assigned trips (planned and in progress)' })
  async findTrips(
    @CurrentUser() user: CurrentUserData,
    @Query() query: DriverTripQueryDto,
  ): Promise<TripResponseDto[]> {
    return this.tripService.findAllForDriver(user.userId, query, false);
  }

  @Get('trips/history')
  @ApiOperation({ summary: 'Get trip history (completed and cancelled)' })
  async findTripsHistory(
    @CurrentUser() user: CurrentUserData,
    @Query() query: DriverTripQueryDto,
  ): Promise<TripResponseDto[]> {
    return this.tripService.findAllForDriver(user.userId, query, true);
  }

  @Get('trips/active')
  @ApiOperation({ summary: 'Get current active trip (in progress)' })
  @ApiResponse({ status: 200, type: ActiveTripResponseDto })
  async findActiveTrip(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ActiveTripResponseDto> {
    return this.tripService.findActiveForDriver(user.userId);
  }

  @Get('trips/:id')
  @ApiOperation({ summary: 'Get trip details with track path' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async findOneTrip(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.findOneForDriver(id, user.userId);
  }

  @Post('trips/:id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a planned trip (vehicle must be assigned)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({
    status: 400,
    description: 'Vehicle must be assigned before starting',
  })
  async startTrip(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.startTripByDriver(id, user.userId);
  }

  @Post('trips/:id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End an in-progress trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  async endTrip(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.endTripByDriver(id, user.userId);
  }
}
