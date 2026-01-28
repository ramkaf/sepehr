import { forwardRef, Module } from '@nestjs/common';
import { EntityFieldBaseService } from './providers/entity-fields.base.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityTypesModule } from '../entity-types/entity-types.module';
import { EntityModule } from '../entity/entity.module';
import {
  BrowserGroupEntity,
  EntityField,
  EntityFieldSchema,
  PlantFieldVisibility,
  PostgresModule,
  RedisModule,
} from 'libs/database';
import { InsightModule } from '../../insight';
import { BrowserGroupService } from './providers/browser-group.service';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([
      EntityField,
      BrowserGroupEntity,
      PlantFieldVisibility,
      EntityFieldSchema,
    ]),
    RedisModule,
    EntityTypesModule,
    EntityModule,
    forwardRef(() => InsightModule),
  ],
  providers: [EntityFieldBaseService, BrowserGroupService],
  exports: [EntityFieldBaseService, BrowserGroupService],
})
export class EntityFieldsModule {}
