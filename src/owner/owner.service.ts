import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerUserDto } from './dto/owner-user.dto';
import { CompanyOwner } from '../common/entities';
import { OwnerMapper } from './owner.mapper';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(CompanyOwner)
    private companyOwnerRepository: Repository<CompanyOwner>,
  ) {}

  async getProfile(userId: number): Promise<OwnerUserDto> {
    const owner = await this.companyOwnerRepository.findOne({
      where: { company_owner_id: userId },
      relations: ['company'],
    });

    if (!owner) {
      throw new NotFoundException('Owner profile not found');
    }

    return OwnerMapper.toUserDto(owner, owner.company);
  }
}
