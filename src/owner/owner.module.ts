import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import {
  CompanyOwner,
  Company,
  Driver,
  Dispatcher,
  Vehicle,
  Tracker,
  TrackingChannel,
  Trip,
  Invitation,
} from '../common/entities';
import { EmailModule } from '../email/email.module';
import type { StringValue } from 'ms';
import { InvitationController } from './invitations/invitation.controller';
import { EmployeeController } from './employees/employee.controller';
import { ProfileController } from './profile.controller';
import { TrackerController } from './trackers/tracker.controller';
import { VehicleController } from './vehicles/vehicle.controller';
import { TrackingChannelController } from './tracking-channels/tracking-channel.controller';
import { InvitationService } from './invitations/invitation.service';
import { VehicleService } from './vehicles/vehicle.service';
import { TrackerService } from './trackers/tracker.service';
import { TrackingChannelService } from './tracking-channels/tracking-channel.service';
import { EmployeeManagementService } from './employees/employee-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyOwner,
      Company,
      Driver,
      Dispatcher,
      Invitation,
      Vehicle,
      Tracker,
      TrackingChannel,
      Trip,
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
    VehicleController,
    TrackerController,
    TrackingChannelController,
  ],
  providers: [
    OwnerService,
    InvitationService,
    EmployeeManagementService,
    VehicleService,
    TrackerService,
    TrackingChannelService,
  ],
  exports: [OwnerService, InvitationService],
})
export class OwnerModule {}
