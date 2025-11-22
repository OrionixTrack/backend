import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../common/entities';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [TypeOrmModule.forFeature([Driver]), TripModule],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}
