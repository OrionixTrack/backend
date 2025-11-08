import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Trip } from './trip.entity';
import { UserLanguage } from '../types/UserLanguage';

@Entity('driver')
export class Driver {
  @PrimaryGeneratedColumn()
  driver_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  surname: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  register_date: Date;

  @Column({ type: 'int' })
  company_id: number;

  @ManyToOne(() => Company, (company) => company.drivers)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Trip, (trip) => trip.assignedDriver)
  assignedTrips: Trip[];

  @Column({
    type: 'enum',
    enum: UserLanguage,
    default: UserLanguage.ENGLISH,
  })
  language: UserLanguage;
}
