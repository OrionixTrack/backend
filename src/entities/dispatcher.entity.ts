import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Trip } from './trip.entity';

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
}