import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerUserDto } from './dto/owner-user.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyOwner, Company } from '../common/entities';
import { OwnerMapper } from './owner.mapper';
import { CompanyMapper } from '../common/mappers/company.mapper';
import { CompanyDto } from '../common/dto/company.dto';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(CompanyOwner)
    private companyOwnerRepository: Repository<CompanyOwner>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
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

  async updateCompany(
    companyId: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.name = updateCompanyDto.name;
    const updatedCompany = await this.companyRepository.save(company);

    return CompanyMapper.toDto(updatedCompany);
  }
}
