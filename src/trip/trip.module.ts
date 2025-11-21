import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Trip, SensorData } from '../common/entities';
import type { StringValue } from 'ms';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, SensorData]),
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
  ],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
