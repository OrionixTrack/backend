import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { MapService } from './map.service';
import { MapDataResponseDto } from './dto';

@ApiTags('Map')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles(UserRole.COMPANY_OWNER, UserRole.DISPATCHER)
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('active-vehicles')
  @ApiOperation({
    summary: 'Get all vehicles with active trips and their latest positions',
  })
  async getActiveVehicles(
    @CurrentUser() user: CurrentUserData,
  ): Promise<MapDataResponseDto> {
    return this.mapService.getActiveVehicles(user.companyId);
  }
}
