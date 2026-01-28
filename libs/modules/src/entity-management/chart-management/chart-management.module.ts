import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chart, PostgresModule, RedisModule, UserChart } from 'libs/database';
import { InsightModule } from '../../insight';
import { ChartManagementService } from './providers/chart-management..service';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([Chart, UserChart]),
    RedisModule,
  ],
  providers: [ChartManagementService],
  exports: [ChartManagementService],
})
export class ChartManagementModule {}
