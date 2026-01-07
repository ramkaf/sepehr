import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityTypesModule } from '../entity-types/entity-types.module';
import { EntityBaseService } from './providers/entity.base.service';
import { EntityModel, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([EntityModel]),
    RedisModule,
    forwardRef(() => EntityTypesModule),
    forwardRef(() => InsightModule),
  ],
  providers: [EntityBaseService],
  exports: [EntityBaseService],
})
export class EntityModule {}
