import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerUserDto } from './dto/owner-user.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  CompanyOwner,
  Company,
  Driver,
  Dispatcher,
  Vehicle,
  Tracker,
  Trip,
} from '../common/entities';
import { OwnerMapper } from './owner.mapper';
import { CompanyMapper } from '../common/mappers/company.mapper';
import { CompanyDto } from '../common/dto/company.dto';
import { TripStatus } from '../common/types/trip-status';
import { CompanyStatsDto } from './dto/company-stats.dto';

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

  async getCompanyStats(companyId: number): Promise<CompanyStatsDto> {
    const manager = this.companyRepository.manager;

    const [
      driversCount,
      dispatchersCount,
      vehiclesCount,
      trackersCount,
      tripsRawData,
    ] = await Promise.all([
      manager.count(Driver, { where: { company_id: companyId } }),
      manager.count(Dispatcher, { where: { company_id: companyId } }),
      manager.count(Vehicle, { where: { company_id: companyId } }),
      manager.count(Tracker, { where: { company_id: companyId } }),
      manager
        .createQueryBuilder(Trip, 'trip')
        .select('trip.status', 'status')
        .addSelect('COUNT(trip.trip_id)', 'count')
        .where('trip.company_id = :companyId', { companyId })
        .groupBy('trip.status')
        .getRawMany(),
    ]);

    const tripsStats = {
      total: 0,
      planned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    tripsRawData.forEach((row: { status: TripStatus; count: string }) => {
      const count = parseInt(row.count, 10);
      tripsStats.total += count;

      switch (row.status) {
        case TripStatus.PLANNED:
          tripsStats.planned = count;
          break;
        case TripStatus.IN_PROGRESS:
          tripsStats.inProgress = count;
          break;
        case TripStatus.COMPLETED:
          tripsStats.completed = count;
          break;
        case TripStatus.CANCELLED:
          tripsStats.cancelled = count;
          break;
      }
    });

    return {
      driversCount,
      dispatchersCount,
      vehiclesCount,
      trackersCount,
      trips: tripsStats,
    };
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
