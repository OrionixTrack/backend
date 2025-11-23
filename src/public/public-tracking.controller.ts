import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PublicTrackingService } from './public-tracking.service';
import { PublicChannelResponseDto } from './dto/public-channel-response.dto';

@ApiTags('Public Tracking')
@Controller('public/tracking')
export class PublicTrackingController {
  constructor(private readonly publicTrackingService: PublicTrackingService) {}

  @Get(':token')
  @Public()
  @ApiOperation({
    summary: 'Get public tracking channel with trip info and vehicle position',
  })
  @ApiParam({ name: 'token', description: 'Public channel token' })
  async getChannel(
    @Param('token') token: string,
  ): Promise<PublicChannelResponseDto> {
    return this.publicTrackingService.getChannel(token);
  }
}
