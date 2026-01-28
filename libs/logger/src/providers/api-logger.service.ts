import { Injectable, Logger, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { ApiLog } from 'libs/database';
import { IPayload } from 'libs/interfaces';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IPayload;
    }
  }
}

@Injectable()
export class ApiLoggerService {
  private readonly logger = new Logger(ApiLoggerService.name);

  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {}

  createLogEntry(
    request: Request,
    response: Response,
    status: number | null = null,
  ): ApiLog {
    const { method, url, body, query, params, ip, user } = request;
    const userUuid = null;
    const responseStatus = status ? status : response.statusCode;

    const apiLog = new ApiLog();
    apiLog.method = method;
    apiLog.url = url;
    apiLog.body = body || {};
    apiLog.queryParams = query || {};
    apiLog.params = params || {};
    apiLog.ipAddress = ip;
    apiLog.rawRequest = {
      headers: request.headers,
    };
    apiLog.statusCode = response.statusCode;
    apiLog.status =
      responseStatus >= 200 && responseStatus < 300
        ? 'success'
        : 'client_error';
    apiLog.userUuid = userUuid;
    return apiLog;
  }

  updateLogWithResponseAndDuration(log: ApiLog, data: any): void {
    log.responseData = data ? data : null;
  }

  updateLogWithError(
    log: ApiLog,
    errorMessage: string,
    startTime: number | null = null,
  ): void {
    log.errorMessage = errorMessage;
    log.responseTime = startTime ? Date.now() - startTime : 0;
  }

  async saveLog(log: ApiLog): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(log);
      await queryRunner.commitTransaction();
    } catch (dbError) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error saving API log to database:', dbError.message);
    } finally {
      await queryRunner.release();
    }
  }
}
