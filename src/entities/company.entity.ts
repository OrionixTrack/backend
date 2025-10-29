import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CompanyOwner } from './company-owner.entity';
import { Driver } from './driver.entity';
import { Dispatcher } from './dispatcher.entity';
import { Vehicle } from './vehicle.entity';
import { Tracker } from './tracker.entity';
import { TrackingChannel } from './tracking-channel.entity';
import { Trip } from './trip.entity';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn()
  company_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToOne(() => CompanyOwner, (owner) => owner.company)
  owner: CompanyOwner;

  @OneToMany(() => Driver, (driver) => driver.company)
  drivers: Driver[];

  @OneToMany(() => Dispatcher, (dispatcher) => dispatcher.company)
  dispatchers: Dispatcher[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.company)
  vehicles: Vehicle[];

  @OneToMany(() => Tracker, (tracker) => tracker.company)
  trackers: Tracker[];

  @OneToMany(() => TrackingChannel, (channel) => channel.company)
  trackingChannels: TrackingChannel[];

  @OneToMany(() => Trip, (trip) => trip.company)
  trips: Trip[];
}