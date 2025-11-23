import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AuthModule } from './auth/auth.module';
import { OwnerModule } from './owner/owner.module';
import { DispatcherModule } from './dispatcher/dispatcher.module';
import { DriverModule } from './driver/driver.module';
import { TripModule } from './trip/trip.module';
import { PublicModule } from './public/public.module';
import { IotModule } from './iot/iot.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get('REDIS_HOST', 'redis')}:${configService.get('REDIS_PORT', 6379)}`,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    OwnerModule,
    DispatcherModule,
    DriverModule,
    TripModule,
    PublicModule,
    IotModule,
    RealtimeModule,
  ],
})
export class AppModule {}
