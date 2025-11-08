import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Trip } from './trip.entity';

@Entity('tracking_channel')
export class TrackingChannel {
  @PrimaryGeneratedColumn()
  tracking_channel_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  company_id: number;

  @Column({ type: 'int', nullable: true })
  assigned_trip_id?: number;

  @ManyToOne(() => Company, (company) => company.trackingChannels)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Trip, (trip) => trip.trackingChannels)
  @JoinColumn({ name: 'assigned_trip_id' })
  assignedTrip: Trip;
}
