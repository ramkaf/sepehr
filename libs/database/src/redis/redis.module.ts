import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';
import { NestConfigModule } from 'libs/config';
import RedisSingleton from './redis.singleton';

@Module({
  imports: [NestConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  private readonly logger = new Logger(RedisModule.name);

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    RedisSingleton.setInstance(this.redisService);
    this.logger.log('RedisService registered in singleton');
  }
}
