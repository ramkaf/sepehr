import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { NestConfigService } from 'libs/config';
import { REDIS_TTLSECOND } from 'libs/constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: NestConfigService) {
    const configs = {
      host: this.configService.redisHost,
      port: this.configService.redisPort,
      password: this.configService.redisPassword,
    };
    this.redis = new Redis(configs);

    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });
  }

  getClient() {
    return this.redis;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expireSecond = ttlSeconds ? ttlSeconds : REDIS_TTLSECOND;
    try {
      await this.redis.setex(key, expireSecond, value);
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async getObject<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting object ${key}:`, error);
      throw error;
    }
  }

  async setObject(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.set(key, serialized, ttlSeconds);
    } catch (error) {
      this.logger.error(`Error setting object ${key}:`, error);
      throw error;
    }
  }

  async stackPush(stackKey: string, value: string): Promise<number> {
    try {
      return await this.redis.lpush(stackKey, value);
    } catch (error) {
      this.logger.error(`Error pushing to stack ${stackKey}:`, error);
      throw error;
    }
  }

  async stackPushObject(stackKey: string, value: any): Promise<number> {
    try {
      const serialized = JSON.stringify(value);
      return await this.redis.lpush(stackKey, serialized);
    } catch (error) {
      this.logger.error(`Error pushing object to stack ${stackKey}:`, error);
      throw error;
    }
  }

  async stackPop(stackKey: string): Promise<string | null> {
    try {
      return await this.redis.lpop(stackKey);
    } catch (error) {
      this.logger.error(`Error popping from stack ${stackKey}:`, error);
      throw error;
    }
  }

  async stackPopObject<T = any>(stackKey: string): Promise<T | null> {
    try {
      const value = await this.redis.lpop(stackKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error popping object from stack ${stackKey}:`, error);
      throw error;
    }
  }

  async stackPeek(stackKey: string): Promise<string | null> {
    try {
      const result = await this.redis.lrange(stackKey, 0, 0);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error peeking stack ${stackKey}:`, error);
      throw error;
    }
  }

  async stackSize(stackKey: string): Promise<number> {
    try {
      return await this.redis.llen(stackKey);
    } catch (error) {
      this.logger.error(`Error getting stack size ${stackKey}:`, error);
      throw error;
    }
  }

  async queueEnqueue(queueKey: string, value: string): Promise<number> {
    try {
      return await this.redis.rpush(queueKey, value);
    } catch (error) {
      this.logger.error(`Error enqueuing to queue ${queueKey}:`, error);
      throw error;
    }
  }

  async queueEnqueueObject(queueKey: string, value: any): Promise<number> {
    try {
      const serialized = JSON.stringify(value);
      return await this.redis.rpush(queueKey, serialized);
    } catch (error) {
      this.logger.error(`Error enqueuing object to queue ${queueKey}:`, error);
      throw error;
    }
  }

  async queueDequeue(queueKey: string): Promise<string | null> {
    try {
      return await this.redis.lpop(queueKey);
    } catch (error) {
      this.logger.error(`Error dequeuing from queue ${queueKey}:`, error);
      throw error;
    }
  }

  async queueDequeueObject<T = any>(queueKey: string): Promise<T | null> {
    try {
      const value = await this.redis.lpop(queueKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(
        `Error dequeuing object from queue ${queueKey}:`,
        error,
      );
      throw error;
    }
  }

  async queueDequeueBlocking(
    queueKey: string,
    timeoutSeconds = 0,
  ): Promise<string | null> {
    try {
      const result = await this.redis.blpop(queueKey, timeoutSeconds);
      return result ? result[1] : null;
    } catch (error) {
      this.logger.error(
        `Error blocking dequeue from queue ${queueKey}:`,
        error,
      );
      throw error;
    }
  }

  async queuePeek(queueKey: string): Promise<string | null> {
    try {
      const result = await this.redis.lrange(queueKey, 0, 0);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error peeking queue ${queueKey}:`, error);
      throw error;
    }
  }

  async queueSize(queueKey: string): Promise<number> {
    try {
      return await this.redis.llen(queueKey);
    } catch (error) {
      this.logger.error(`Error getting queue size ${queueKey}:`, error);
      throw error;
    }
  }

  async deleteKeysByPattern(keyPattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(keyPattern);
      if (keys.length === 0) {
        this.logger.log(`No keys found matching pattern: ${keyPattern}`);
        return 0;
      }

      const deletedCount = await this.redis.del(...keys);
      this.logger.log(
        `Deleted ${deletedCount} keys matching pattern: ${keyPattern}`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error(
        `Error deleting keys with pattern ${keyPattern}:`,
        error,
      );
      throw error;
    }
  }

  async deleteKeysContaining(substring: string): Promise<number> {
    try {
      const pattern = `*${substring}*`;
      return await this.deleteKeysByPattern(pattern);
    } catch (error) {
      this.logger.error(`Error deleting keys containing ${substring}:`, error);
      throw error;
    }
  }

  async getKeysByPattern(keyPattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(keyPattern);
    } catch (error) {
      this.logger.error(
        `Error getting keys with pattern ${keyPattern}:`,
        error,
      );
      throw error;
    }
  }

  async deleteExpiredKeys(
    keyPattern: string,
    secondsBeforeExpiry = 0,
  ): Promise<number> {
    try {
      const keys = await this.redis.keys(keyPattern);
      const keysToDelete: string[] = [];

      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -2 || (ttl > 0 && ttl <= secondsBeforeExpiry)) {
          keysToDelete.push(key);
        }
      }

      if (keysToDelete.length === 0) {
        return 0;
      }

      const deletedCount = await this.redis.del(...keysToDelete);
      this.logger.log(`Deleted ${deletedCount} expired/expiring keys`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Error deleting expired keys:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      throw error;
    }
  }

  async delete(...keys: string[]): Promise<number> {
    try {
      return await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(`Error deleting keys:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting TTL for key ${key}:`, error);
      throw error;
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      throw error;
    }
  }

  async modify(key: string, updatedObjString: string) {
    const ttl = await this.getTTL(key); // Get remaining TTL in seconds
    await this.set(key, updatedObjString, ttl);
  }

  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }
}
