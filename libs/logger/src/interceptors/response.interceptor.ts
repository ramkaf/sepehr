import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ResponseFormatterService } from '../providers/response-formatter.service';
import { IResponse } from '../interfaces/response.interface';
import { RedisService } from 'libs/database';
import { DataSource } from 'typeorm';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  IResponse<T>
> {
  constructor(
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const statusCode = response.statusCode;
    const startTime = Date.now();

    return next.handle().pipe(
      mergeMap(async (data: T) => {
        // call your async function here
        const pks = await this.getPrimaryKeys();
        console.log({pks});
        
        return {
          success: true,
          message: 'عملیات با موفقیت انجام شد',
          data,
          primaryKeys: pks, // include your async data
          timestamp: new Date().toISOString(),
          path: request.method,
          statusCode,
          error: null,
          responseTime: Date.now() - startTime,
        };
      }),
    );
  }
  async getPrimaryKeys() {
    let primaryKeys = await this.redisService.getObject('cached_primary_key');
    if (!primaryKeys) {
      const query = `SELECT table_name, primary_key_field FROM main.primary_key_parameter;`;
      const result = await this.dataSource.manager.query(query, []);
      await this.redisService.setObject('cached_primary_key', result);
      return result;
    }
  }
}
