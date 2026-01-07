import { forwardRef, Module } from '@nestjs/common';
import { ChartDetailService } from './providers/chart-detail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartDetail, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';
import { ChartsModule } from '../charts/charts.module';
import { EntityTypesModule } from '../entity-types/entity-types.module';

@Module({
  imports: [
    ChartsModule,
    PostgresModule,
    EntityTypesModule,
    TypeOrmModule.forFeature([ChartDetail]),
    RedisModule,
    forwardRef(() => InsightModule),
  ],
  providers: [ChartDetailService],
  exports: [ChartDetailService],
})
export class ChartDetailModule {}
