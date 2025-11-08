import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Dispatcher } from './dispatcher.entity';
import { CompanyOwner } from './company-owner.entity';

@Entity('password_reset_token')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  token_id: number;

  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ type: 'int', nullable: true })
  driver_id: number | null;

  @Column({ type: 'int', nullable: true })
  dispatcher_id: number | null;

  @Column({ type: 'int', nullable: true })
  company_owner_id: number | null;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver?: Driver;

  @ManyToOne(() => Dispatcher, { nullable: true })
  @JoinColumn({ name: 'dispatcher_id' })
  dispatcher?: Dispatcher;

  @ManyToOne(() => CompanyOwner, { nullable: true })
  @JoinColumn({ name: 'company_owner_id' })
  company_owner?: CompanyOwner;
}
