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

@Entity('dispatcher')
export class Dispatcher {
  @PrimaryGeneratedColumn()
  dispatcher_id: number;

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

  @ManyToOne(() => Company, (company) => company.dispatchers)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Trip, (trip) => trip.createdByDispatcher)
  createdTrips: Trip[];

  @Column({
    type: 'enum',
    enum: UserLanguage,
    default: UserLanguage.ENGLISH,
  })
  language: UserLanguage;
}
