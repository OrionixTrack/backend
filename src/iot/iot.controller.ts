import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { IotService } from './iot.service';
import { MqttAuthDto, MqttAclDto } from './dto';

@ApiTags('IoT')
@Controller('iot')
export class IotController {
  private readonly logger = new Logger(IotController.name);

  constructor(private readonly iotService: IotService) {}

  @Post('auth')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'MQTT authentication endpoint for EMQX' })
  async authenticate(
    @Body() authDto: MqttAuthDto,
  ): Promise<{ result: string }> {
    const result = await this.iotService.authenticate(
      authDto.username,
      authDto.password,
    );

    if (!result) {
      this.logger.warn(`MQTT auth failed for username: ${authDto.username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    return { result: 'allow' };
  }

  @Post('acl')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'MQTT ACL endpoint for EMQX' })
  checkAcl(@Body() aclDto: MqttAclDto): { result: string } {
    const allowed = this.iotService.checkAcl(
      aclDto.username,
      aclDto.topic,
      aclDto.action,
    );

    if (!allowed) {
      throw new ForbiddenException('Access denied');
    }

    return { result: 'allow' };
  }
}
