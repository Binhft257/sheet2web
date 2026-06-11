import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/enums/user-role.enum';
import { ROLES_KEY } from '../../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: UserRole } | undefined;

    if (!user || !user.role) {
      throw new ForbiddenException('Bạn không có quyền truy cập.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập.');
    }

    return true;
  }
}
