import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispatcherUserDto } from './dto/dispatcher-user.dto';
import { Dispatcher } from '../common/entities';
import { DispatcherMapper } from './dispatcher.mapper';

@Injectable()
export class DispatcherService {
  constructor(
    @InjectRepository(Dispatcher)
    private dispatcherRepository: Repository<Dispatcher>,
  ) {}

  async getProfile(userId: number): Promise<DispatcherUserDto> {
    const dispatcher = await this.dispatcherRepository.findOne({
      where: { dispatcher_id: userId },
      relations: ['company'],
    });

    if (!dispatcher) {
      throw new NotFoundException('Dispatcher profile not found');
    }

    return DispatcherMapper.toUserDto(dispatcher);
  }
}
