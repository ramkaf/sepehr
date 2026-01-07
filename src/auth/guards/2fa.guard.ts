import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TwoFactorAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if route requires 2FA verification
    const require2FA = this.reflector.get<boolean>(
      'require2FA',
      context.getHandler(),
    );

    if (require2FA && user.isTwoFactorEnabled && !user.isTwoFactorVerified) {
      throw new UnauthorizedException('2FA verification required');
    }

    return true;
  }
}

// Decorator to mark routes that require 2FA
import { SetMetadata } from '@nestjs/common';

export const Require2FA = () => SetMetadata('require2FA', true);
