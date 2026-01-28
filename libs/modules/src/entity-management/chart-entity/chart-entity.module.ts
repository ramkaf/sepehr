import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartEntity, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';
import { ChartEntityService } from './providers/chart-entity.service';
import { ChartDetailModule } from '../chart-detail/chart-detail.module';
import { EntityFieldsModule } from '../entity-fields/entity-fields.module';
import { EntityModule } from '../entity/entity.module';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([ChartEntity]),
    RedisModule,
    forwardRef(() => InsightModule),
    ChartDetailModule,
    EntityFieldsModule,
    EntityModule,
  ],
  providers: [ChartEntityService],
  exports: [ChartEntityService],
})
export class ChartEntityModule {}
