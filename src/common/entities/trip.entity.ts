import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Driver } from './driver.entity';
import { Dispatcher } from './dispatcher.entity';
import { Vehicle } from './vehicle.entity';
import { TrackingChannel } from './tracking-channel.entity';
import { SensorData } from './sensor-data.entity';
import { TripStatus } from '../types/trip-status';

@Entity('trip')
export class Trip {
  @PrimaryGeneratedColumn()
  trip_id: number;

  @Column({ type: 'int' })
  company_id: number;

  @Column({ type: 'int', nullable: true })
  assigned_driver_id?: number;

  @Column({ type: 'int' })
  created_by_dispatcher_id: number;

  @Column({ type: 'int', nullable: true })
  vehicle_id?: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.PLANNED,
  })
  status: TripStatus;

  @Column({ type: 'timestamp', nullable: true })
  planned_start_datetime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_start_datetime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_datetime?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_info?: string;

  @Column({ type: 'text', nullable: true })
  start_address?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  start_latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  start_longitude?: number;

  @Column({ type: 'text' })
  finish_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  finish_latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  finish_longitude: number;

  @ManyToOne(() => Company, (company) => company.trips)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Driver, (driver) => driver.assignedTrips)
  @JoinColumn({ name: 'assigned_driver_id' })
  assignedDriver: Driver;

  @ManyToOne(() => Dispatcher, (dispatcher) => dispatcher.createdTrips)
  @JoinColumn({ name: 'created_by_dispatcher_id' })
  createdByDispatcher: Dispatcher;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToMany(() => TrackingChannel, (channel) => channel.assignedTrip)
  trackingChannels: TrackingChannel[];

  @OneToMany(() => SensorData, (sensorData) => sensorData.trip)
  sensorData: SensorData[];
}
