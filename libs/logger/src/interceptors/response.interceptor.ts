import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ResponseFormatterService } from '../providers/response-formatter.service';
import { IResponse } from '../interfaces/response.interface';
import { ApiLoggerService } from '../providers/api-logger.service';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  IResponse<T>
> {
  constructor(
    private apiLoggerService: ApiLoggerService,
    private responseFormatter: ResponseFormatterService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logger = new Logger(ResponseInterceptor.name);
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const statusCode = response.statusCode;
    const startTime = Date.now();
    const apiLog = this.apiLoggerService.createLogEntry(request, response);
    return next.handle().pipe(
      tap((data) => {
        this.apiLoggerService.updateLogWithResponseAndDuration(apiLog, data);
        if (request.method !== 'GET') {
          apiLog.responseTime = Date.now() - startTime;
          this.apiLoggerService.saveLog(apiLog);
        }
      }),
      map((data: T) =>
        this.responseFormatter.formatSuccess(
          data,
          request,
          statusCode,
          startTime,
        ),
      ),
    );
  }
}
