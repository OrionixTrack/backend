import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export enum TrackerSortField {
  NAME = 'name',
  ID = 'tracker_id',
}

export class TrackerQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: TrackerSortField,
    default: TrackerSortField.NAME,
  })
  @IsEnum(TrackerSortField)
  @IsOptional()
  sortBy?: TrackerSortField = TrackerSortField.NAME;
}
