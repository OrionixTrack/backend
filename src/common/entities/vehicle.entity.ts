import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Tracker } from './tracker.entity';
import { Trip } from './trip.entity';

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn()
  vehicle_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  license_plate: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model?: string;

  @Column({ type: 'int', nullable: true })
  production_year?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  capacity?: number;

  @Column({ type: 'int', nullable: true })
  company_id?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  last_latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  last_longitude?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  last_speed?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  last_bearing?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  last_temperature?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  last_humidity?: number;

  @Column({ type: 'timestamp', nullable: true })
  last_update_time?: Date;

  @ManyToOne(() => Company, (company) => company.vehicles)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToOne(() => Tracker, (tracker) => tracker.vehicle)
  tracker: Tracker;

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];
}
