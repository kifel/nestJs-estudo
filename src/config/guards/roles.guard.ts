import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/enums/UserRole';
import { AuthRequest } from 'src/models/auth-request';
import { AuthRepository } from 'src/repositories/auth-repository';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const roles = await this.authRepository.validateRoles(request.user);

    const hasRequiredRole = requiredRoles.some((requiredRole) =>
      roles.includes(requiredRole),
    );

    return hasRequiredRole;
  }
}
