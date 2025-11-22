import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DispatcherTrackingChannelService } from './dispatcher-tracking-channel.service';
import { TrackingChannelResponseDto } from '../owner/tracking-channels/dto/tracking-channel-response.dto';
import { AssignTrackingChannelDto } from './dto/assign-tracking-channel.dto';

@ApiTags('Dispatcher - Tracking Channels')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.DISPATCHER)
@Controller('dispatcher/tracking-channels')
export class DispatcherTrackingChannelController {
  constructor(
    private readonly trackingChannelService: DispatcherTrackingChannelService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tracking channels' })
  async findAll(
    @CurrentUser() user: CurrentUserData,
  ): Promise<TrackingChannelResponseDto[]> {
    return this.trackingChannelService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tracking channel by ID' })
  @ApiParam({ name: 'id', description: 'Tracking channel ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TrackingChannelResponseDto> {
    return this.trackingChannelService.findOne(id, user.companyId);
  }

  @Put(':id/assign-trip')
  @ApiOperation({ summary: 'Assign or unassign trip to tracking channel' })
  @ApiParam({ name: 'id', description: 'Tracking channel ID' })
  async assignTrip(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: AssignTrackingChannelDto,
  ): Promise<TrackingChannelResponseDto> {
    return this.trackingChannelService.assignTrip(
      id,
      user.companyId,
      dto.tripId ?? null,
    );
  }
}
