import { forwardRef, Module } from '@nestjs/common';
import { EntityTypeBaseService } from './providers/entity-type.base.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityModule } from '../entity/entity.module';
import { InsightModule } from '../../insight';
import { EntityType, PostgresModule, RedisModule } from 'libs/database';

@Module({
  imports: [
    PostgresModule,
    forwardRef(() => EntityModule),
    TypeOrmModule.forFeature([EntityType]),
    RedisModule,
    forwardRef(() => InsightModule),
  ],
  providers: [EntityTypeBaseService],
  exports: [EntityTypeBaseService],
})
export class EntityTypesModule {}
