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
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';

@ApiTags('Vehicles')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_OWNER)
@Controller('owner/vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() query: VehicleQueryDto,
  ): Promise<VehicleResponseDto[]> {
    return this.vehicleService.findAll(user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<VehicleResponseDto> {
    return this.vehicleService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehicleService.create(user.companyId, createVehicleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehicleService.update(id, user.companyId, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete vehicle' })
  @ApiParam({ name: 'id', description: 'Vehicle ID' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ): Promise<void> {
    return this.vehicleService.remove(id, user.companyId);
  }
}
