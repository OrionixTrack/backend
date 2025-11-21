import {
  Body,
  Controller,
  Delete,
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
  ApiTags,
} from '@nestjs/swagger';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/types/user-role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TrackingChannelService } from './tracking-channel.service';
import { CreateTrackingChannelDto } from './dto/create-tracking-channel.dto';
import { UpdateTrackingChannelDto } from './dto/update-tracking-channel.dto';
import { TrackingChannelResponseDto } from './dto/tracking-channel-response.dto';
import { TrackingChannelQueryDto } from './dto/tracking-channel-query.dto';

@ApiTags('Tracking Channels')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_OWNER)
@Controller('owner/tracking-channels')
export class TrackingChannelController {
  constructor(
    private readonly trackingChannelService: TrackingChannelService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tracking channels' })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() query: TrackingChannelQueryDto,
  ): Promise<TrackingChannelResponseDto[]> {
    return this.trackingChannelService.findAll(user.companyId, query);
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

  @Post()
  @ApiOperation({ summary: 'Create a new tracking channel' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createTrackingChannelDto: CreateTrackingChannelDto,
  ): Promise<TrackingChannelResponseDto> {
    return this.trackingChannelService.create(
      user.companyId,
      createTrackingChannelDto,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tracking channel' })
  @ApiParam({ name: 'id', description: 'Tracking channel ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() updateTrackingChannelDto: UpdateTrackingChannelDto,
  ): Promise<TrackingChannelResponseDto> {
    return this.trackingChannelService.update(
      id,
      user.companyId,
      updateTrackingChannelDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tracking channel' })
  @ApiParam({ name: 'id', description: 'Tracking channel ID' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<void> {
    return this.trackingChannelService.remove(id, user.companyId);
  }
}
