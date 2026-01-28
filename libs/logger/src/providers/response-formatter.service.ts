import { Injectable, HttpException } from '@nestjs/common';
import { Request } from 'express';
import { IResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseFormatterService {
  formatSuccess<T>(
    data: T,
    request: Request,
    statusCode: number,
    startTime: number,
  ): IResponse<T> {
    return {
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data,
      timestamp: new Date().toISOString(),
      path: request.method,
      statusCode,
      error: null,
      responseTime: Date.now() - startTime,
    };
  }

  formatError(
    error: HttpException,
    request: Request,
    statusCode: number,
  ): IResponse<null> {
    let message = 'something goes wrong';
    let status = statusCode;
    let responseError = 'Internal Server Error';

    if (error instanceof HttpException) {
      status = error.getStatus();
      const errorResponse = error.getResponse();

      // Get the error message
      message = error.message;

      if (typeof errorResponse === 'string') {
        message = errorResponse;
        // For string responses, use the exception constructor name
        responseError = error.constructor.name.replace('Exception', '');
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        const resObj = errorResponse as {
          message?: string | string[];
          error?: string;
          statusCode?: number;
        };

        if (Array.isArray(resObj.message)) {
          message = resObj.message.join(', ');
        } else if (resObj.message) {
          message = resObj.message;
        } else {
          message = error.message || 'Unexpected error';
        }

        responseError =
          resObj.error || error.constructor.name.replace('Exception', '');
      } else {
        message = error.message;
        responseError = error.constructor.name.replace('Exception', '');
      }
    }

    return {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.method,
      statusCode: status,
      error: responseError,
      responseTime: 0,
    };
  }
}
