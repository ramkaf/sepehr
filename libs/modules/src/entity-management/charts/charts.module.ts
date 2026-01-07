import { forwardRef, Module } from '@nestjs/common';
import { ChartService } from './providers/charts.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Chart, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([Chart]),
    RedisModule,
    forwardRef(() => InsightModule),
  ],
  providers: [ChartService],
  exports: [ChartService],
})
export class ChartsModule {}
