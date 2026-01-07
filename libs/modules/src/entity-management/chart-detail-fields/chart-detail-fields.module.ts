import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetailField, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';
import { ChartDetailFieldService } from './providers/chart-detail-fields.service';
import { ChartDetailModule } from '../chart-detail/chart-detail.module';
import { EntityFieldsModule } from '../entity-fields/entity-fields.module';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([DetailField]),
    RedisModule,
    forwardRef(() => InsightModule),
    ChartDetailModule,
    EntityFieldsModule,
  ],
  providers: [ChartDetailFieldService],
  exports: [ChartDetailFieldService],
})
export class ChartDetailFieldsModule {}
