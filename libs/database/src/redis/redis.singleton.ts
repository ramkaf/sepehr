import { RedisService } from './redis.service';

class RedisSingleton {
  private static instance: RedisService | null = null;

  static setInstance(redisService: RedisService): void {
    this.instance = redisService;
  }

  static getInstance(): RedisService {
    if (!this.instance) {
      throw new Error(
        'RedisService not initialized. Make sure RedisModule is imported.',
      );
    }
    return this.instance;
  }
}

export default RedisSingleton;
