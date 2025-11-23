import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrackingChannel, Trip } from '../common/entities';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { IotModule } from '../iot/iot.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingChannel, Trip]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    forwardRef(() => IotModule),
  ],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
