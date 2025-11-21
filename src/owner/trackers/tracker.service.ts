import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Tracker, Vehicle } from '../../common/entities';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { UpdateTrackerDto } from './dto/update-tracker.dto';
import { TrackerResponseDto } from './dto/tracker-response.dto';
import { TrackerMapper } from './tracker.mapper';
import { TrackerQueryDto } from './dto/tracker-query.dto';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(Tracker)
    private trackerRepository: Repository<Tracker>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(
    companyId: number,
    query: TrackerQueryDto,
  ): Promise<TrackerResponseDto[]> {
    const qb = this.trackerRepository
      .createQueryBuilder('tracker')
      .where('tracker.company_id = :companyId', { companyId });

    if (query.search) {
      qb.andWhere('tracker.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    const trackers = await qb
      .orderBy(`tracker.${query.sortBy}`, query.sortOrder)
      .skip(query.offset)
      .take(query.limit)
      .getMany();

    return trackers.map((tracker) => TrackerMapper.toDto(tracker));
  }

  async findOne(id: number, companyId: number): Promise<TrackerResponseDto> {
    const tracker = await this.trackerRepository.findOne({
      where: { tracker_id: id, company_id: companyId },
    });

    if (!tracker) {
      throw new NotFoundException('Tracker not found');
    }

    return TrackerMapper.toDto(tracker);
  }

  async create(
    companyId: number,
    createTrackerDto: CreateTrackerDto,
  ): Promise<TrackerResponseDto> {
    if (createTrackerDto.vehicle_id) {
      await this.validateVehicleAssignment(
        createTrackerDto.vehicle_id,
        companyId,
      );
    }

    const deviceSecretToken = this.generateSecretToken();

    const tracker = this.trackerRepository.create({
      name: createTrackerDto.name,
      device_secret_token: deviceSecretToken,
      vehicle_id: createTrackerDto.vehicle_id,
      company_id: companyId,
    });

    const savedTracker = await this.trackerRepository.save(tracker);

    return TrackerMapper.toDto(savedTracker);
  }

  async update(
    id: number,
    companyId: number,
    updateTrackerDto: UpdateTrackerDto,
  ): Promise<TrackerResponseDto> {
    const tracker = await this.trackerRepository.findOne({
      where: { tracker_id: id, company_id: companyId },
    });

    if (!tracker) {
      throw new NotFoundException('Tracker not found');
    }

    if (
      updateTrackerDto.vehicle_id !== undefined &&
      updateTrackerDto.vehicle_id !== null
    ) {
      await this.validateVehicleAssignment(
        updateTrackerDto.vehicle_id,
        companyId,
        id,
      );
    }

    tracker.name = updateTrackerDto.name;
    tracker.vehicle_id =
      updateTrackerDto.vehicle_id === null
        ? undefined
        : (updateTrackerDto.vehicle_id ?? tracker.vehicle_id);

    const updatedTracker = await this.trackerRepository.save(tracker);

    return TrackerMapper.toDto(updatedTracker);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const tracker = await this.trackerRepository.findOne({
      where: { tracker_id: id, company_id: companyId },
    });

    if (!tracker) {
      throw new NotFoundException('Tracker not found');
    }

    await this.trackerRepository.remove(tracker);
  }

  async regenerateToken(
    id: number,
    companyId: number,
  ): Promise<TrackerResponseDto> {
    const tracker = await this.trackerRepository.findOne({
      where: { tracker_id: id, company_id: companyId },
    });

    if (!tracker) {
      throw new NotFoundException('Tracker not found');
    }

    tracker.device_secret_token = this.generateSecretToken();
    const updatedTracker = await this.trackerRepository.save(tracker);

    return TrackerMapper.toDto(updatedTracker);
  }

  private async validateVehicleAssignment(
    vehicleId: number,
    companyId: number,
    excludeTrackerId?: number,
  ): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicle_id: vehicleId, company_id: companyId },
    });

    if (!vehicle) {
      throw new BadRequestException(
        'Vehicle not found or does not belong to your company',
      );
    }

    const existingTracker = await this.trackerRepository.findOne({
      where: { vehicle_id: vehicleId },
    });

    if (existingTracker && existingTracker.tracker_id !== excludeTrackerId) {
      throw new ConflictException(
        'This vehicle already has a tracker assigned',
      );
    }
  }

  private generateSecretToken(): string {
    return randomBytes(32).toString('hex');
  }
}
