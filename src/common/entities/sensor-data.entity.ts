import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trip } from './trip.entity';

@Entity('sensor_data')
@Index('idx_sensor_data_trip_time', ['trip_id', 'datetime'])
export class SensorData {
  @PrimaryGeneratedColumn()
  sensor_data_id: number;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  speed?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity?: number;

  @Column({ type: 'int' })
  trip_id: number;

  @ManyToOne(() => Trip, (trip) => trip.sensorData)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;
}
