import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class MqttAclDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsIn(['publish', 'subscribe'])
  action: 'publish' | 'subscribe';
}
