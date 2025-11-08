import { Module } from '@nestjs/common';
import { DispatcherController } from './dispatcher.controller';
import { DispatcherService } from './dispatcher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispatcher } from '../common/entities';

@Module({
  controllers: [DispatcherController],
  providers: [DispatcherService],
  imports: [TypeOrmModule.forFeature([Dispatcher])],
  exports: [DispatcherService],
})
export class DispatcherModule {}
