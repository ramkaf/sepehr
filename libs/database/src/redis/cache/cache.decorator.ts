import { createHash } from 'crypto';
import RedisSingleton from '../redis.singleton';
import { parseTimeToSeconds } from 'libs/utils';

export const CACHE_TTL = '30m'; // 10 minutes in seconds

function generateCacheKey(
  className: string,
  methodName: string,
  args: any[],
): string {
  const argsHash = createHash('md5').update(JSON.stringify(args)).digest('hex');
  return `cache:${className}:${methodName}:${argsHash}`;
}

export function Cacheable(cacheExpireTimeInSecond?: string) {
  const ttlString = cacheExpireTimeInSecond ?? CACHE_TTL;
  const ttl = parseTimeToSeconds(ttlString);
  return (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let redisService;

      try {
        redisService = RedisSingleton.getInstance();
      } catch (error) {
        console.warn(
          `RedisService not available. Caching skipped for ${target.constructor.name}.${propertyName}`,
        );
        return originalMethod.apply(this, args);
      }

      const className = this.constructor.name;
      const cacheKey = generateCacheKey(className, propertyName, args);

      // Try to get from cache first
      try {
        const cached = await redisService.getObject(cacheKey);
        if (cached !== null) {
          return cached; // Already parsed by getObject
        }
      } catch (error) {
        console.error(`Cache get error for key ${cacheKey}:`, error);
        // Continue to execute original method if cache fails
      }

      // Execute original method if not in cache
      const result = await originalMethod.apply(this, args);

      // Store in cache (fire and forget to avoid blocking)
      try {
        await redisService.setObject(cacheKey, result, ttl);
      } catch (error) {
        console.error(`Cache set error for key ${cacheKey}:`, error);
        // Don't throw error, just log it and return result
      }

      return result;
    };

    return descriptor;
  };
}
