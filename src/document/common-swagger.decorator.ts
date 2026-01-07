import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiOperationWithDocs(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status: 200, description: 'Success' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
  );
}

export function ApiGetOperationWithDocs(summary: string) {
  return applyDecorators(
    ApiOperationWithDocs(summary),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
}

export function ApiCreateOperationWithDocs(summary: string) {
  return applyDecorators(
    ApiOperationWithDocs(summary),
    ApiResponse({ status: 201, description: 'Created' }),
  );
}
