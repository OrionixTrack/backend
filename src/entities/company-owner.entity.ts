import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('company_owner')
export class CompanyOwner {
  @PrimaryGeneratedColumn()
  company_owner_id: number;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'int' })
  company_id: number;

  @OneToOne(() => Company, (company) => company.owner)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}