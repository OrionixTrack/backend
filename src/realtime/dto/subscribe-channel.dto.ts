import { IsNotEmpty, IsString } from 'class-validator';

export class SubscribeChannelDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
