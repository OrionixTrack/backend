import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { CompanyOwner, Dispatcher, Driver } from '../../common/entities';
import { UpdateOwnerProfileDto } from '../dto/update-owner-profile.dto';

@Injectable()
export class EmployeeManagementService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Dispatcher)
    private dispatcherRepository: Repository<Dispatcher>,
    @InjectRepository(CompanyOwner)
    private companyOwnerRepository: Repository<CompanyOwner>,
  ) {}

  async getDriversByCompany(
    companyId: number,
    query: EmployeeQueryDto,
  ): Promise<EmployeeResponseDto[]> {
    const { limit, offset, search, sortBy, sortOrder } = query;

    const queryBuilder = this.driverRepository
      .createQueryBuilder('driver')
      .where('driver.company_id = :companyId', { companyId });

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(driver.name) LIKE LOWER(:search)', {
            search: `%${search}%`,
          })
            .orWhere('LOWER(driver.surname) LIKE LOWER(:search)', {
              search: `%${search}%`,
            })
            .orWhere('LOWER(driver.email) LIKE LOWER(:search)', {
              search: `%${search}%`,
            });
        }),
      );
    }

    queryBuilder.orderBy(`driver.${sortBy}`, sortOrder);

    const drivers = await queryBuilder.skip(offset).take(limit).getMany();

    return drivers.map((driver) => this.toEmployeeDto(driver));
  }

  async getDispatchersByCompany(
    companyId: number,
    query: EmployeeQueryDto,
  ): Promise<EmployeeResponseDto[]> {
    const { limit, offset, search, sortBy, sortOrder } = query;

    const queryBuilder = this.dispatcherRepository
      .createQueryBuilder('dispatcher')
      .where('dispatcher.company_id = :companyId', { companyId });

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(dispatcher.name) LIKE LOWER(:search)', {
            search: `%${search}%`,
          })
            .orWhere('LOWER(dispatcher.surname) LIKE LOWER(:search)', {
              search: `%${search}%`,
            })
            .orWhere('LOWER(dispatcher.email) LIKE LOWER(:search)', {
              search: `%${search}%`,
            });
        }),
      );
    }

    queryBuilder.orderBy(`dispatcher.${sortBy}`, sortOrder);

    const dispatchers = await queryBuilder.skip(offset).take(limit).getMany();

    return dispatchers.map((dispatcher) => this.toEmployeeDto(dispatcher));
  }

  async updateDriver(
    driverId: number,
    companyId: number,
    updateDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: driverId, company_id: companyId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (updateDto.name !== undefined) {
      driver.name = updateDto.name;
    }
    if (updateDto.surname !== undefined) {
      driver.surname = updateDto.surname;
    }

    const updatedDriver = await this.driverRepository.save(driver);
    return this.toEmployeeDto(updatedDriver);
  }

  async updateDispatcher(
    dispatcherId: number,
    companyId: number,
    updateDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const dispatcher = await this.dispatcherRepository.findOne({
      where: { dispatcher_id: dispatcherId, company_id: companyId },
    });

    if (!dispatcher) {
      throw new NotFoundException('Dispatcher not found');
    }

    if (updateDto.name !== undefined) {
      dispatcher.name = updateDto.name;
    }
    if (updateDto.surname !== undefined) {
      dispatcher.surname = updateDto.surname;
    }

    const updatedDispatcher = await this.dispatcherRepository.save(dispatcher);
    return this.toEmployeeDto(updatedDispatcher);
  }

  async removeDriver(driverId: number, companyId: number): Promise<void> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: driverId, company_id: companyId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    await this.driverRepository.delete({ driver_id: driverId });
  }

  async removeDispatcher(
    dispatcherId: number,
    companyId: number,
  ): Promise<void> {
    const dispatcher = await this.dispatcherRepository.findOne({
      where: { dispatcher_id: dispatcherId, company_id: companyId },
    });

    if (!dispatcher) {
      throw new NotFoundException('Dispatcher not found');
    }

    await this.dispatcherRepository.delete({ dispatcher_id: dispatcherId });
  }

  async updateOwnerProfile(
    ownerId: number,
    companyId: number,
    updateDto: UpdateOwnerProfileDto,
  ): Promise<{ message: string }> {
    const owner = await this.companyOwnerRepository.findOne({
      where: { company_owner_id: ownerId, company_id: companyId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    if (updateDto.full_name !== undefined) {
      owner.full_name = updateDto.full_name;
    }
    if (updateDto.language !== undefined) {
      owner.language = updateDto.language;
    }

    await this.companyOwnerRepository.save(owner);
    return { message: 'Profile updated successfully' };
  }

  async updateDriverProfile(
    driverId: number,
    companyId: number,
    updateDto: UpdateEmployeeDto,
  ): Promise<{ message: string }> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: driverId, company_id: companyId },
    });

    if (!driver) {
      throw new ForbiddenException('Access denied');
    }

    if (updateDto.name !== undefined) {
      driver.name = updateDto.name;
    }
    if (updateDto.surname !== undefined) {
      driver.surname = updateDto.surname;
    }

    await this.driverRepository.save(driver);
    return { message: 'Profile updated successfully' };
  }

  async updateDispatcherProfile(
    dispatcherId: number,
    companyId: number,
    updateDto: UpdateEmployeeDto,
  ): Promise<{ message: string }> {
    const dispatcher = await this.dispatcherRepository.findOne({
      where: { dispatcher_id: dispatcherId, company_id: companyId },
    });

    if (!dispatcher) {
      throw new ForbiddenException('Access denied');
    }

    if (updateDto.name !== undefined) {
      dispatcher.name = updateDto.name;
    }
    if (updateDto.surname !== undefined) {
      dispatcher.surname = updateDto.surname;
    }

    await this.dispatcherRepository.save(dispatcher);
    return { message: 'Profile updated successfully' };
  }

  private toEmployeeDto(employee: Driver | Dispatcher): EmployeeResponseDto {
    if ('driver_id' in employee) {
      return {
        id: employee.driver_id,
        name: employee.name,
        surname: employee.surname,
        email: employee.email,
        register_date: employee.register_date,
        language: employee.language,
      };
    } else {
      return {
        id: employee.dispatcher_id,
        name: employee.name,
        surname: employee.surname,
        email: employee.email,
        register_date: employee.register_date,
        language: employee.language,
      };
    }
  }
}
