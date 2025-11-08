import { Request } from 'express';
import { CurrentUserData } from '../../auth/decorators/current-user.decorator';

export interface RequestWithUser extends Request {
  user: CurrentUserData;
}
