import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { UserLanguage } from '../types/UserLanguage';

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

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'varchar', nullable: true })
  email_verification_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verification_token_expires: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_verification_email_sent: Date | null;

  @Column({ type: 'int' })
  company_id: number;

  @OneToOne(() => Company, (company) => company.owner)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({
    type: 'enum',
    enum: UserLanguage,
    default: UserLanguage.ENGLISH,
  })
  language: UserLanguage;
}
