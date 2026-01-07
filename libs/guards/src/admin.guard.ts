import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.validateIpRange(request.ip);
  }

  validateIpRange(ip: string) {
    if (ip === '::1') return true;
    if (ip === '::ffff:127.0.0.1') return true;
    throw new ForbiddenException(
      'Forbidden IP range — your IP is not allowed to access this endpoint.',
    );
  }
}
