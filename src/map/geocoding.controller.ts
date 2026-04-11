import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import {
  ForwardGeocodeQueryDto,
  ForwardGeocodeResponseDto,
  GeocodeResultDto,
  ReverseGeocodeQueryDto,
} from './dto';
import { GeocodingService } from './geocoding.service';

@ApiTags('Geocoding')
@ApiBearerAuth('JWT-auth')
@Controller('map/geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Forward geocode an address into coordinates',
  })
  @ApiOkResponse({ type: ForwardGeocodeResponseDto })
  async search(
    @CurrentUser() user: CurrentUserData,
    @Query() query: ForwardGeocodeQueryDto,
  ): Promise<ForwardGeocodeResponseDto> {
    return this.geocodingService.search(user.userId, query);
  }

  @Get('reverse')
  @ApiOperation({
    summary: 'Reverse geocode coordinates into a human-readable address',
  })
  @ApiOkResponse({ type: GeocodeResultDto })
  async reverse(
    @CurrentUser() user: CurrentUserData,
    @Query() query: ReverseGeocodeQueryDto,
  ): Promise<GeocodeResultDto> {
    return this.geocodingService.reverse(user.userId, query);
  }
}
