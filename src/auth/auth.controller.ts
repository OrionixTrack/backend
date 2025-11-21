import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from '../owner/dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Public } from './decorators/public.decorator';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { OwnerUserDto } from '../owner/dto/owner-user.dto';
import { OwnerAuthResponseDto } from '../owner/dto/owner-auth-response.dto';
import { DispatcherAuthResponseDto } from '../dispatcher/dto/dispatcher-auth-response.dto';
import { DriverAuthResponseDto } from '../driver/dto/driver-auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from './types/user-role.enum';
import { AcceptInvitationDto } from '../owner/invitations/dto/accept-invitation.dto';
import { InvitationService } from '../owner/invitations/invitation.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitationService: InvitationService,
  ) {}

  @Public()
  @Post('owner/register')
  @ApiOperation({
    summary: 'Register a new company owner',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async registerOwner(
    @Body() registerDto: RegisterOwnerDto,
  ): Promise<OwnerUserDto> {
    return this.authService.registerOwner(registerDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email address',
    description:
      'Verifies the email address and returns JWT token for automatic login',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token, or email already verified',
  })
  async verifyEmail(
    @Body() verifyDto: VerifyEmailDto,
  ): Promise<OwnerAuthResponseDto> {
    return this.authService.verifyEmail(verifyDto.token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
  })
  @ApiResponse({
    status: 429,
    description:
      'Too many requests - Must wait before requesting another email',
  })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Public()
  @Post('owner/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Company owner login',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'Email not verified',
  })
  async loginOwner(@Body() loginDto: LoginDto): Promise<OwnerAuthResponseDto> {
    return this.authService.loginOwner(loginDto);
  }

  @Public()
  @Post('dispatcher/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dispatcher login',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async loginDispatcher(
    @Body() loginDto: LoginDto,
  ): Promise<DispatcherAuthResponseDto> {
    return this.authService.loginDispatcher(loginDto);
  }

  @Public()
  @Post('driver/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Driver login',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async loginDriver(
    @Body() loginDto: LoginDto,
  ): Promise<DriverAuthResponseDto> {
    return this.authService.loginDriver(loginDto);
  }

  @Public()
  @Post('owner/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset for company owner',
  })
  async forgotPasswordOwner(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(
      UserRole.COMPANY_OWNER,
      forgotPasswordDto,
    );
  }

  @Public()
  @Post('dispatcher/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset for dispatcher',
  })
  async forgotPasswordDispatcher(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(
      UserRole.DISPATCHER,
      forgotPasswordDto,
    );
  }

  @Public()
  @Post('driver/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset for driver',
  })
  async forgotPasswordDriver(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(UserRole.DRIVER, forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password using a unique token for any user role',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept an invitation and create employee account',
  })
  async acceptInvitation(
    @Body() acceptDto: AcceptInvitationDto,
  ): Promise<DriverAuthResponseDto | DispatcherAuthResponseDto> {
    return this.invitationService.acceptInvitation(acceptDto);
  }
}
