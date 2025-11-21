import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import ms, { StringValue } from 'ms';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Invitation } from '../../common/entities';
import { CompanyOwner, Driver, Dispatcher } from '../../common/entities';
import { EmailService } from '../../email/email.service';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { EmployeeRole } from '../../common/types/employee-role';
import { InvitationStatus } from '../../common/types/invitation-status';
import { DriverMapper } from '../../driver/driver.mapper';
import { DispatcherMapper } from '../../dispatcher/dispatcher.mapper';
import { DriverAuthResponseDto } from '../../driver/dto/driver-auth-response.dto';
import { DispatcherAuthResponseDto } from '../../dispatcher/dto/dispatcher-auth-response.dto';
import { UserRole } from '../../auth/types/user-role.enum';
import { JwtPayload } from '../../auth/types/jwt-payload.interface';

type EmployeeAuthResponse = DriverAuthResponseDto | DispatcherAuthResponseDto;

@Injectable()
export class InvitationService {
  private readonly invitationExpirationTime: StringValue;

  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(CompanyOwner)
    private companyOwnerRepository: Repository<CompanyOwner>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Dispatcher)
    private dispatcherRepository: Repository<Dispatcher>,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.invitationExpirationTime = this.configService.get<StringValue>(
      'INVITATION_EXPIRATION_TIME',
    )!;
  }

  async createInvitation(
    ownerId: number,
    companyId: number,
    inviteDto: InviteEmployeeDto,
  ): Promise<InvitationResponseDto> {
    const { email, role } = inviteDto;

    const owner = await this.companyOwnerRepository.findOne({
      where: { company_owner_id: ownerId, company_id: companyId },
      relations: ['company'],
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const existingDriver = await this.driverRepository.findOne({
      where: { email },
    });
    const existingDispatcher = await this.dispatcherRepository.findOne({
      where: { email },
    });
    const existingOwner = await this.companyOwnerRepository.findOne({
      where: { email },
    });

    if (existingDriver || existingDispatcher || existingOwner) {
      throw new ConflictException('Email already registered');
    }

    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        email,
        company_id: companyId,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException('Invitation already sent to this email');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMilliseconds(
      expiresAt.getMilliseconds() + ms(this.invitationExpirationTime),
    );

    const invitation = this.invitationRepository.create({
      email,
      role,
      token,
      status: InvitationStatus.PENDING,
      expires_at: expiresAt,
      company_id: companyId,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    await this.emailService.sendInvitationEmail(
      email,
      token,
      owner.company.name,
      role,
      owner.language,
    );

    return this.toResponseDto(savedInvitation);
  }

  async getInvitationsByCompany(
    companyId: number,
  ): Promise<InvitationResponseDto[]> {
    const invitations = await this.invitationRepository.find({
      where: { company_id: companyId },
      order: { created_at: 'DESC' },
    });

    return invitations.map((inv) => this.toResponseDto(inv));
  }

  async acceptInvitation(
    acceptDto: AcceptInvitationDto,
  ): Promise<EmployeeAuthResponse> {
    const { token, name, surname, password, language } = acceptDto;

    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ['company'],
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is no longer valid');
    }

    if (invitation.expires_at < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let authResponse: EmployeeAuthResponse;

    if (invitation.role === EmployeeRole.DRIVER) {
      const driver = this.driverRepository.create({
        name,
        surname,
        email: invitation.email,
        password: hashedPassword,
        language,
        company_id: invitation.company_id,
      });
      const savedDriver = await this.driverRepository.save(driver);

      const driverWithCompany = await this.driverRepository.findOne({
        where: { driver_id: savedDriver.driver_id },
        relations: ['company'],
      });

      if (!driverWithCompany) {
        throw new Error('Failed to load driver with company');
      }

      authResponse = this.generateDriverAuthToken(driverWithCompany);
    } else if (invitation.role === EmployeeRole.DISPATCHER) {
      const dispatcher = this.dispatcherRepository.create({
        name,
        surname,
        email: invitation.email,
        password: hashedPassword,
        language,
        company_id: invitation.company_id,
      });
      const savedDispatcher = await this.dispatcherRepository.save(dispatcher);

      const dispatcherWithCompany = await this.dispatcherRepository.findOne({
        where: { dispatcher_id: savedDispatcher.dispatcher_id },
        relations: ['company'],
      });

      if (!dispatcherWithCompany) {
        throw new Error('Failed to load dispatcher with company');
      }

      authResponse = this.generateDispatcherAuthToken(dispatcherWithCompany);
    } else {
      throw new BadRequestException('Invalid role');
    }

    invitation.status = InvitationStatus.ACCEPTED;
    invitation.accepted_at = new Date();
    await this.invitationRepository.save(invitation);

    return authResponse;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredInvitations(): Promise<void> {
    const expiredInvitations = await this.invitationRepository.find({
      where: {
        status: InvitationStatus.PENDING,
        expires_at: LessThan(new Date()),
      },
    });

    for (const invitation of expiredInvitations) {
      invitation.status = InvitationStatus.EXPIRED;
    }

    if (expiredInvitations.length > 0) {
      await this.invitationRepository.save(expiredInvitations);
    }
  }

  private generateDriverAuthToken(driver: Driver): DriverAuthResponseDto {
    const payload: JwtPayload = {
      sub: driver.driver_id,
      email: driver.email,
      role: UserRole.DRIVER,
      companyId: driver.company_id,
    };

    const accessToken = this.jwtService.sign(payload);
    const driverDto = DriverMapper.toUserDto(driver);

    return {
      access_token: accessToken,
      driver: driverDto,
    };
  }

  private generateDispatcherAuthToken(
    dispatcher: Dispatcher,
  ): DispatcherAuthResponseDto {
    const payload: JwtPayload = {
      sub: dispatcher.dispatcher_id,
      email: dispatcher.email,
      role: UserRole.DISPATCHER,
      companyId: dispatcher.company_id,
    };

    const accessToken = this.jwtService.sign(payload);
    const dispatcherDto = DispatcherMapper.toUserDto(dispatcher);

    return {
      access_token: accessToken,
      dispatcher: dispatcherDto,
    };
  }

  private toResponseDto(invitation: Invitation): InvitationResponseDto {
    return {
      invitation_id: invitation.invitation_id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      accepted_at: invitation.accepted_at,
    };
  }
}
