import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { EmployeeController } from './employee.controller';
import { ProfileController } from './profile.controller';
import { EmployeeManagementService } from './employee-management.service';
import { CompanyOwner, Company, Driver, Dispatcher } from '../common/entities';
import { Invitation } from '../common/entities';
import { EmailModule } from '../email/email.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyOwner,
      Company,
      Driver,
      Dispatcher,
      Invitation,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    EmailModule,
  ],
  controllers: [
    OwnerController,
    InvitationController,
    EmployeeController,
    ProfileController,
  ],
  providers: [OwnerService, InvitationService, EmployeeManagementService],
  exports: [OwnerService, InvitationService],
})
export class OwnerModule {}
