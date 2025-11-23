import { Tracker } from '../../common/entities';

export type MqttAuthResult =
  | { type: 'tracker'; tracker: Tracker }
  | { type: 'internal' }
  | null;
