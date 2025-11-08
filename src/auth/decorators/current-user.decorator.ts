import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../common/types/request-with.user';
import { UserRole } from '../types/user-role.enum';

export interface CurrentUserData {
  userId: number;
  email: string;
  role: UserRole;
  companyId: number;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
