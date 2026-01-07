export interface IResponse<T> {
  success: boolean;
  data: T;
  path: string;
  timestamp: string;
  message: string;
  error: string | null;
  statusCode: number;
  responseTime: number;
}
