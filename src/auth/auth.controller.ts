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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register/owner')
  @ApiOperation({
    summary: 'Register a new company owner',
  })
  @ApiResponse({
    status: 201,
    description:
      'Registration successful. Returns the newly created owner profile. A verification email has been sent.',
    type: OwnerUserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
    schema: {
      example: {
        message: 'Email already registered',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
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
    status: 200,
    description:
      'Email verified successfully. User is automatically logged in.',
    type: OwnerAuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token, or email already verified',
    schema: {
      example: {
        message: 'Invalid verification token',
        error: 'Bad Request',
      },
    },
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
    status: 200,
    description: 'Verification email sent successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
      },
    },
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
  @Post('login/owner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Company owner login',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: OwnerAuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Email not verified',
    schema: {
      example: {
        message: 'Please verify your email before logging in',
        error: 'Forbidden',
      },
    },
  })
  async loginOwner(@Body() loginDto: LoginDto): Promise<OwnerAuthResponseDto> {
    return this.authService.loginOwner(loginDto);
  }

  @Public()
  @Post('login/dispatcher')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dispatcher login',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: DispatcherAuthResponseDto,
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
  @Post('login/driver')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Driver login',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: DriverAuthResponseDto,
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
}
