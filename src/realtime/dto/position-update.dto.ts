export class PositionUpdateDto {
  tripId: number | null;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  datetime: Date;
}
