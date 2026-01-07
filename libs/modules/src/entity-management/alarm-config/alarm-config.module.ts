import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmConfigService } from './providers/alarm-config.service';
import { EntityModule } from '../entity/entity.module';
import { AlarmConfig, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';

@Module({
  imports: [
    PostgresModule,
    EntityModule,
    TypeOrmModule.forFeature([AlarmConfig]),
    RedisModule,
    forwardRef(() => InsightModule),
  ],
  providers: [AlarmConfigService],
  exports: [AlarmConfigService],
})
export class AlarmConfigsModule {}
