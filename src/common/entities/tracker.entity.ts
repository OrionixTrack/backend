import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Vehicle } from './vehicle.entity';

@Entity('tracker')
export class Tracker {
  @PrimaryGeneratedColumn()
  tracker_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar' })
  device_secret_token_hash: string;

  @Column({ type: 'int', nullable: true })
  vehicle_id?: number;

  @Column({ type: 'int' })
  company_id: number;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.tracker)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Company, (company) => company.trackers)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
