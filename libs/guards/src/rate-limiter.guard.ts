import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerException,
  ThrottlerStorage,
  // ThrottlerModuleOptions,
} from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ApiLoggerService } from 'libs/logger';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private apiLoggerService: ApiLoggerService,
  ) {
    super(options, storageService, reflector);
  }

  protected override async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Log the rate limit violation
    const apiLog = this.apiLoggerService.createLogEntry(request, response);
    this.apiLoggerService.updateLogWithError(
      apiLog,
      'Rate limit exceeded',
      startTime,
    );
    this.apiLoggerService.saveLog(apiLog);

    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}
