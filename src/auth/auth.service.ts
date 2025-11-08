import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RegisterOwnerDto } from '../owner/dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { UserRole } from './types/user-role.enum';
import { JwtPayload } from './types/jwt-payload.interface';
import { OwnerUserDto } from '../owner/dto/owner-user.dto';
import { OwnerAuthResponseDto } from '../owner/dto/owner-auth-response.dto';
import { DispatcherAuthResponseDto } from '../dispatcher/dto/dispatcher-auth-response.dto';
import { DriverAuthResponseDto } from '../driver/dto/driver-auth-response.dto';
import { Company, CompanyOwner, Dispatcher, Driver } from '../common/entities';
import ms, { StringValue } from 'ms';
import { OwnerMapper } from '../owner/owner.mapper';
import { DispatcherMapper } from '../dispatcher/dispatcher.mapper';
import { DriverMapper } from '../driver/driver.mapper';

@Injectable()
export class AuthService {
  private readonly verificationEmailTimeout: StringValue;
  private readonly verificationEmailExpirationTime: StringValue;

  constructor(
    @InjectRepository(CompanyOwner)
    private companyOwnerRepository: Repository<CompanyOwner>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Dispatcher)
    private dispatcherRepository: Repository<Dispatcher>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.verificationEmailTimeout = this.configService.get<StringValue>(
      'VERIFICATION_EMAIL_TIMEOUT',
    )!;
    this.verificationEmailExpirationTime = this.configService.get<StringValue>(
      'VERIFICATION_EMAIL_EXPIRATION_TIME',
    )!;
  }

  async registerOwner(registerDto: RegisterOwnerDto): Promise<OwnerUserDto> {
    const { email, password, full_name, company_name, language } = registerDto;

    const existingOwner = await this.companyOwnerRepository.findOne({
      where: { email },
    });

    if (existingOwner) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);
    const { token, expires } = this.generateVerificationToken();

    const company = this.companyRepository.create({
      name: company_name,
    });
    const savedCompany = await this.companyRepository.save(company);

    const owner = this.companyOwnerRepository.create({
      full_name,
      email,
      language,
      password: hashedPassword,
      company_id: savedCompany.company_id,
      is_email_verified: false,
      email_verification_token: token,
      email_verification_token_expires: expires,
      last_verification_email_sent: new Date(),
    });

    const savedOwner = await this.companyOwnerRepository.save(owner);

    await this.emailService.sendVerificationEmail(email, token, owner.language);

    return OwnerMapper.toUserDto(savedOwner, savedCompany);
  }

  async verifyEmail(token: string): Promise<OwnerAuthResponseDto> {
    const owner = await this.companyOwnerRepository.findOne({
      where: { email_verification_token: token },
      relations: ['company'],
    });

    if (!owner) {
      throw new BadRequestException('Invalid verification token');
    }

    if (owner.email_verification_token_expires! < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    if (owner.is_email_verified) {
      throw new BadRequestException('Email already verified');
    }

    owner.is_email_verified = true;
    owner.email_verification_token = null;
    owner.email_verification_token_expires = null;
    await this.companyOwnerRepository.save(owner);

    await this.emailService.sendWelcomeEmail(
      owner.email,
      owner.company.name,
      owner.language,
    );

    return this.generateOwnerToken(owner);
  }

  async resendVerificationEmail(email: string) {
    const owner = await this.companyOwnerRepository.findOne({
      where: { email },
    });

    if (!owner) {
      throw new NotFoundException('User not found');
    }

    if (owner.is_email_verified) {
      throw new BadRequestException('Email already verified');
    }

    this.checkVerificationEmailTimeout(owner.last_verification_email_sent);

    const { token, expires } = this.generateVerificationToken();

    owner.email_verification_token = token;
    owner.email_verification_token_expires = expires;
    owner.last_verification_email_sent = new Date();
    await this.companyOwnerRepository.save(owner);

    await this.emailService.sendVerificationEmail(email, token, owner.language);

    return {
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  async loginOwner(loginDto: LoginDto): Promise<OwnerAuthResponseDto> {
    const { email, password } = loginDto;

    const owner = await this.companyOwnerRepository.findOne({
      where: { email },
      relations: ['company'],
    });

    if (!owner) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!owner.is_email_verified) {
      throw new HttpException(
        {
          message: 'Please verify your email before logging in',
          error: 'Forbidden',
        },
        403,
      );
    }

    await this.validatePassword(password, owner.password);

    return this.generateOwnerToken(owner);
  }

  async loginDispatcher(
    loginDto: LoginDto,
  ): Promise<DispatcherAuthResponseDto> {
    const { email, password } = loginDto;

    const dispatcher = await this.dispatcherRepository.findOne({
      where: { email },
      relations: ['company'],
    });

    if (!dispatcher || !dispatcher.company) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.validatePassword(password, dispatcher.password);

    return this.generateDispatcherToken(dispatcher);
  }

  async loginDriver(loginDto: LoginDto): Promise<DriverAuthResponseDto> {
    const { email, password } = loginDto;

    const driver = await this.driverRepository.findOne({
      where: { email },
      relations: ['company'],
    });

    if (!driver || !driver.company) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.validatePassword(password, driver.password);

    return this.generateDriverToken(driver);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private generateVerificationToken(): { token: string; expires: Date } {
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() + ms(this.verificationEmailExpirationTime),
    );
    return { token, expires };
  }

  private checkVerificationEmailTimeout(lastEmailSent: Date | null): void {
    if (!lastEmailSent) return;

    const timeSinceLastEmail = Date.now() - lastEmailSent.getTime();
    const timeoutMilliseconds = ms(this.verificationEmailTimeout);

    if (timeSinceLastEmail < timeoutMilliseconds) {
      const timeoutMinutes = timeoutMilliseconds / 60_000;
      const remainingMilliseconds = timeoutMilliseconds - timeSinceLastEmail;
      const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
      const remainingMinutes = Math.ceil(remainingMilliseconds / 60_000);

      throw new HttpException(
        {
          message:
            `Please wait ${remainingMinutes} minute(s) before requesting another verification email. ` +
            `You can request a new email every ${timeoutMinutes} minute(s).`,
          error: 'Too Many Requests',
          retryAfter: remainingSeconds,
        },
        429,
      );
    }
  }

  private generateOwnerToken(owner: CompanyOwner): OwnerAuthResponseDto {
    const payload: JwtPayload = {
      sub: owner.company_owner_id,
      email: owner.email,
      role: UserRole.COMPANY_OWNER,
      companyId: owner.company_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      owner: OwnerMapper.toUserDto(owner, owner.company),
    };
  }

  private generateDispatcherToken(
    dispatcher: Dispatcher,
  ): DispatcherAuthResponseDto {
    const payload: JwtPayload = {
      sub: dispatcher.dispatcher_id,
      email: dispatcher.email,
      role: UserRole.DISPATCHER,
      companyId: dispatcher.company_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      dispatcher: DispatcherMapper.toUserDto(dispatcher),
    };
  }

  private generateDriverToken(driver: Driver): DriverAuthResponseDto {
    const payload: JwtPayload = {
      sub: driver.driver_id,
      email: driver.email,
      role: UserRole.DRIVER,
      companyId: driver.company_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      driver: DriverMapper.toUserDto(driver),
    };
  }
}
