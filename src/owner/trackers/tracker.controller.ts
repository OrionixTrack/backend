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
import { TrackerService } from './tracker.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';
import { TrackerResponseDto } from './dto/tracker-response.dto';
import { TrackerQueryDto } from './dto/tracker-query.dto';

@ApiTags('Trackers')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_OWNER)
@Controller('owner/trackers')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trackers' })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() query: TrackerQueryDto,
  ): Promise<TrackerResponseDto[]> {
    return this.trackerService.findAll(user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tracker by ID' })
  @ApiParam({ name: 'id', description: 'Tracker ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TrackerResponseDto> {
    return this.trackerService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tracker' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createTrackerDto: CreateTrackerDto,
  ): Promise<TrackerResponseDto> {
    return this.trackerService.create(user.companyId, createTrackerDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tracker' })
  @ApiParam({ name: 'id', description: 'Tracker ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() updateTrackerDto: UpdateTrackerDto,
  ): Promise<TrackerResponseDto> {
    return this.trackerService.update(id, user.companyId, updateTrackerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tracker' })
  @ApiParam({ name: 'id', description: 'Tracker ID' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<void> {
    return this.trackerService.remove(id, user.companyId);
  }

  @Post(':id/regenerate-token')
  @ApiOperation({ summary: 'Regenerate tracker secret token' })
  @ApiParam({ name: 'id', description: 'Tracker ID' })
  async regenerateToken(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<TrackerResponseDto> {
    return this.trackerService.regenerateToken(id, user.companyId);
  }
}
