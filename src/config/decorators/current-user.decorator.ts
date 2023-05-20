import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../../models/auth-request';
import { UserFromJwt } from '../../models/user-from-jwt';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserFromJwt => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);
