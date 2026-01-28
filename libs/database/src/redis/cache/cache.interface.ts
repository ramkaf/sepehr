export interface CacheOptions {
  ttl?: number;
  excludeMethods?: string[];
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  generateCacheKey(className: string, methodName: string, args: any[]): string;
}
