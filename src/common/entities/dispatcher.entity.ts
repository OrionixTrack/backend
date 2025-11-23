import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Trip } from './trip.entity';
import { UserLanguage } from '../types/UserLanguage';

@Entity('dispatcher')
@Index('IDX_dispatcher_email_active', ['email'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class Dispatcher {
  @PrimaryGeneratedColumn()
  dispatcher_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  surname: string;

  @Column({ type: 'varchar', length: 255 })
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

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
