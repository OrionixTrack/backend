import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverUserDto } from './dto/driver-user.dto';
import { Driver } from '../common/entities';
import { DriverMapper } from './driver.mapper';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async getProfile(userId: number): Promise<DriverUserDto> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: userId },
      relations: ['company'],
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return DriverMapper.toUserDto(driver);
  }
}
