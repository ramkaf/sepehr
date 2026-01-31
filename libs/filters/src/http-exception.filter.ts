// http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ResponseFormatterService,
} from 'libs/logger';

@Catch(HttpException) // You can also use @Catch() to catch all exceptions
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly responseFormatter: ResponseFormatterService,
  ) {}
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = this.responseFormatter.formatError(
      exception,
      request,
      status,
    );
    return response.status(status).json(errorResponse);
  }
}
