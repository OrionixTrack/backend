import { PositionUpdateDto } from './position-update.dto';

export class TelemetryUpdateDto extends PositionUpdateDto {
  temperature?: number;
  humidity?: number;
}
