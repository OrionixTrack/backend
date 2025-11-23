export class PositionUpdateDto {
  tripId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  datetime: Date;
}
