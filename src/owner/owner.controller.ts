import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OwnerService } from './owner.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/types/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnerUserDto } from './dto/owner-user.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyDto } from '../common/dto/company.dto';
import { CompanyStatsDto } from './dto/company-stats.dto';

@ApiTags('Owner')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('owner')
@Roles(UserRole.COMPANY_OWNER)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current Company Owner profile' })
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OwnerUserDto> {
    return this.ownerService.getProfile(user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get company statistics' })
  async getStats(
    @CurrentUser() user: CurrentUserData,
  ): Promise<CompanyStatsDto> {
    return this.ownerService.getCompanyStats(user.companyId);
  }

  @Put('company')
  @ApiOperation({ summary: 'Update company information' })
  async updateCompany(
    @CurrentUser() user: CurrentUserData,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    return this.ownerService.updateCompany(user.companyId, updateCompanyDto);
  }
}
