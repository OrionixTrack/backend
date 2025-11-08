import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../types/jwt-payload.interface';
import { UserRole } from '../types/user-role.enum';
import { CompanyOwner, Dispatcher, Driver } from '../../common/entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(CompanyOwner)
    private companyOwnerRepository: Repository<CompanyOwner>,
    @InjectRepository(Dispatcher)
    private dispatcherRepository: Repository<Dispatcher>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, role, email, companyId } = payload;

    let user: CompanyOwner | Dispatcher | Driver | null;
    switch (role) {
      case UserRole.COMPANY_OWNER:
        user = await this.companyOwnerRepository.findOne({
          where: { company_owner_id: sub },
        });
        if (!user || !user.is_email_verified) {
          throw new UnauthorizedException(
            'Email not verified or user not found',
          );
        }
        break;
      case UserRole.DISPATCHER:
        user = await this.dispatcherRepository.findOne({
          where: { dispatcher_id: sub },
        });
        break;
      case UserRole.DRIVER:
        user = await this.driverRepository.findOne({
          where: { driver_id: sub },
        });
        break;
      default:
        throw new UnauthorizedException('Invalid user role');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: sub,
      email,
      role,
      companyId,
    };
  }
}
