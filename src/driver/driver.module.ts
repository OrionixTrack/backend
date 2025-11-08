import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../common/entities';

@Module({
  controllers: [DriverController],
  providers: [DriverService],
  imports: [TypeOrmModule.forFeature([Driver])],
  exports: [DriverService],
})
export class DriverModule {}
