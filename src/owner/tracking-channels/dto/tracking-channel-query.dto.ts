import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export enum TrackingChannelSortField {
  NAME = 'name',
  ID = 'tracking_channel_id',
}

export class TrackingChannelQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: TrackingChannelSortField,
    default: TrackingChannelSortField.NAME,
  })
  @IsEnum(TrackingChannelSortField)
  @IsOptional()
  sortBy?: TrackingChannelSortField = TrackingChannelSortField.NAME;
}
