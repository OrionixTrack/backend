import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { TripQueryDto } from './dto/trip-query.dto';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TripService } from './trip.service';
import { TripResponseDto } from './dto/trip-response.dto';

@ApiTags('Trips')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_OWNER)
@Controller('owner/trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trips with filtering' })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() query: TripQueryDto,
  ): Promise<TripResponseDto[]> {
    return this.tripService.findAll(user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip details with encoded track path' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TripResponseDto> {
    return this.tripService.findOne(id, user.companyId);
  }
}
