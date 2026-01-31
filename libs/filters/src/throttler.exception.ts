// throttler-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ResponseFormatterService } from 'libs/logger';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly responseFormatter: ResponseFormatterService,
  ) {}

  async catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.TOO_MANY_REQUESTS;
    const errorResponse = this.responseFormatter.formatError(
      exception,
      request,
      status,
    );

    return response.status(status).json(errorResponse);
  }
}
