import { SensorData } from '../../common/entities';

export interface SaveTelemetryResult {
  sensorData: SensorData;
  tripId: number | null;
  companyId: number;
}
