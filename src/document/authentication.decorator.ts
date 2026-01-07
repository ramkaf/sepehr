import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';

export function Auth() {
  return applyDecorators(ApiBearerAuth('JWT-auth'), ApiSecurity('JWT-auth'));
}
