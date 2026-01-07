// src/auth/decorators/auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { Roles } from './roles.decorator';
import { RoleGuard } from '../guards/roles.guard';
import { UserRole } from 'libs/enums';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(UseGuards(JwtAuthGuard, RoleGuard), Roles(...roles));
}
