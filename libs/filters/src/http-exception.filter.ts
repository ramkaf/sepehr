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
  ApiLoggerService,
  IResponse,
  ResponseFormatterService,
} from 'libs/logger';

@Catch(HttpException) // You can also use @Catch() to catch all exceptions
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private apiLoggerService: ApiLoggerService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse() as HttpException;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;

    const apiLog = this.apiLoggerService.createLogEntry(request, response);
    this.apiLoggerService.updateLogWithError(apiLog, message);
    this.apiLoggerService.saveLog(apiLog);
    const errorResponse = this.responseFormatter.formatError(
      exception,
      request,
      status,
    );
    return response.status(status).json(errorResponse);
  }
}
