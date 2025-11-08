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
import {
  Company,
  CompanyOwner,
  Dispatcher,
  Driver,
  PasswordResetToken,
} from '../common/entities';
import ms, { StringValue } from 'ms';
import { OwnerMapper } from '../owner/owner.mapper';
import { DispatcherMapper } from '../dispatcher/dispatcher.mapper';
import { DriverMapper } from '../driver/driver.mapper';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DispatcherUserDto } from '../dispatcher/dto/dispatcher-user.dto';
import { DriverUserDto } from '../driver/dto/driver-user.dto';

type UserEntity = CompanyOwner | Dispatcher | Driver;
type AuthResponse =
  | OwnerAuthResponseDto
  | DispatcherAuthResponseDto
  | DriverAuthResponseDto;

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
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
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

    return this.generateAuthToken(
      owner,
      UserRole.COMPANY_OWNER,
    ) as OwnerAuthResponseDto;
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

    return this.generateAuthToken(
      owner,
      UserRole.COMPANY_OWNER,
    ) as OwnerAuthResponseDto;
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

    return this.generateAuthToken(
      dispatcher,
      UserRole.DISPATCHER,
    ) as DispatcherAuthResponseDto;
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

    return this.generateAuthToken(
      driver,
      UserRole.DRIVER,
    ) as DriverAuthResponseDto;
  }

  async forgotPassword(
    role: UserRole,
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.findUserByRoleAndEmail(role, email);

    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const { token, expiresAt, userIdField } =
      this.generatePasswordResetToken(user);

    await this.passwordResetTokenRepository.save({
      token,
      ...userIdField,
      expires_at: expiresAt,
    });

    await this.emailService.sendPasswordResetEmail(email, token, user.language);

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, new_password } = resetPasswordDto;

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.expires_at < new Date()) {
      await this.passwordResetTokenRepository.delete({
        token_id: resetToken.token_id,
      });
      throw new BadRequestException('Reset token has expired');
    }

    let userId: number;
    let repository: Repository<UserEntity>;
    let role: UserRole;

    if (resetToken.company_owner_id) {
      userId = resetToken.company_owner_id;
      repository = this.companyOwnerRepository as Repository<UserEntity>;
      role = UserRole.COMPANY_OWNER;
    } else if (resetToken.dispatcher_id) {
      userId = resetToken.dispatcher_id;
      repository = this.dispatcherRepository as Repository<UserEntity>;
      role = UserRole.DISPATCHER;
    } else if (resetToken.driver_id) {
      userId = resetToken.driver_id;
      repository = this.driverRepository as Repository<UserEntity>;
      role = UserRole.DRIVER;
    } else {
      throw new BadRequestException('Invalid reset token structure');
    }

    const userSearchCriteria: { [key: string]: number } = {};
    const idField = this.getUserIdFieldByRole(role);
    userSearchCriteria[idField] = userId;

    const user = await repository.findOne({ where: userSearchCriteria });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    (user as { password: string }).password =
      await this.hashPassword(new_password);
    await repository.save(user);

    await this.passwordResetTokenRepository.delete({
      token_id: resetToken.token_id,
    });

    return { message: 'Password has been reset successfully' };
  }

  private getUserIdFieldByRole(
    role: UserRole,
  ): keyof CompanyOwner | keyof Dispatcher | keyof Driver {
    switch (role) {
      case UserRole.COMPANY_OWNER:
        return 'company_owner_id';
      case UserRole.DISPATCHER:
        return 'dispatcher_id';
      case UserRole.DRIVER:
        return 'driver_id';
      default:
        throw new BadRequestException('Invalid user role');
    }
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

  private getUserRepository(
    role: UserRole,
  ): Repository<CompanyOwner> | Repository<Dispatcher> | Repository<Driver> {
    switch (role) {
      case UserRole.COMPANY_OWNER:
        return this.companyOwnerRepository;
      case UserRole.DISPATCHER:
        return this.dispatcherRepository;
      case UserRole.DRIVER:
        return this.driverRepository;
      default:
        throw new BadRequestException('Invalid user role');
    }
  }

  private async findUserByRoleAndEmail(
    role: UserRole,
    email: string,
  ): Promise<UserEntity | null> {
    const repository = this.getUserRepository(role);
    return await repository.findOneBy({ email });
  }

  private generatePasswordResetToken(user: UserEntity): {
    token: string;
    expiresAt: Date;
    userIdField: Partial<PasswordResetToken>;
  } {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    let userIdField: Partial<PasswordResetToken>;

    if ('company_owner_id' in user) {
      userIdField = { company_owner_id: user.company_owner_id };
    } else if ('dispatcher_id' in user) {
      userIdField = { dispatcher_id: user.dispatcher_id };
    } else if ('driver_id' in user) {
      userIdField = { driver_id: user.driver_id };
    } else {
      throw new Error('User entity does not have a recognized ID field');
    }

    return { token, expiresAt, userIdField };
  }

  private generateAuthToken(user: UserEntity, role: UserRole): AuthResponse {
    let userId: number;
    let userDto: OwnerUserDto | DispatcherUserDto | DriverUserDto;
    let responseKey: string;
    let userWithCompany: CompanyOwner | Dispatcher | Driver;

    if (role === UserRole.COMPANY_OWNER && 'company_owner_id' in user) {
      const owner = user;
      userId = owner.company_owner_id;
      responseKey = 'owner';
      userDto = OwnerMapper.toUserDto(owner, owner.company);
      userWithCompany = owner;
    } else if (role === UserRole.DISPATCHER && 'dispatcher_id' in user) {
      const dispatcher = user;
      userId = dispatcher.dispatcher_id;
      responseKey = 'dispatcher';
      userDto = DispatcherMapper.toUserDto(dispatcher);
      userWithCompany = dispatcher;
    } else if (role === UserRole.DRIVER && 'driver_id' in user) {
      const driver = user;
      userId = driver.driver_id;
      responseKey = 'driver';
      userDto = DriverMapper.toUserDto(driver);
      userWithCompany = driver;
    } else {
      throw new Error(
        'Unsupported user entity or role mismatch for token generation',
      );
    }

    const payload: JwtPayload = {
      sub: userId,
      email: user.email,
      role: role,
      companyId: userWithCompany.company_id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      [responseKey]: userDto,
    } as unknown as AuthResponse;
  }
}
