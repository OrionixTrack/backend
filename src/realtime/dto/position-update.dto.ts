export class PositionUpdateDto {
  tripId: number | null;
  latitude: number;
  longitude: number;
  speed?: number;
  datetime: Date;
}
