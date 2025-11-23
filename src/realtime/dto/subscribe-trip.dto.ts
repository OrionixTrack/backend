import { IsInt, IsPositive } from 'class-validator';

export class SubscribeTripDto {
  @IsInt()
  @IsPositive()
  tripId: number;
}
