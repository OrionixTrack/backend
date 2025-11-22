import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class AssignTrackingChannelDto {
  @ApiProperty({ example: 1, nullable: true })
  @IsInt()
  @IsOptional()
  tripId?: number | null;
}
