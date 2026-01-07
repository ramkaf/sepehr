import { forwardRef, Module } from '@nestjs/common';
import { PlantRepositoryService } from './repositories/plant.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestConfigModule } from 'libs/config';
import {
  BrowserGroupEntity,
  ElasticModule,
  EntityField,
  EntityFieldSchema,
  EntityModel,
  EntityType,
  FleetManager,
  PostgresModule,
  RedisModule,
  User,
  UserEntityAssignment,
} from 'libs/database';
import { PlantEventService } from './providers/insight-unit/events.service';
import { PlantStateService } from './providers/insight-unit/states.service';
import { PlantStatusService } from './providers/insight-unit/status.service';
import { PlantService } from './providers/plant-unit/plants.service';
import { FleetManagerService } from './providers/plant-unit/fleet-manager.service';
import {
  EntityFieldsModule,
  EntityModule,
  EntityTypesModule,
  SourceModule,
  UserGlobalModule,
} from '../entity-management';
import { EntityTypeService } from './providers/entity-unit/entity-type.service';
import { EntityService } from './providers/entity-unit/entity.service';
import { EntityFieldService } from './providers/entity-unit/entity-field.service';

@Module({
  imports: [
    ElasticModule.register(),
    NestConfigModule,
    RedisModule,
    PostgresModule,
    forwardRef(() => SourceModule),
    TypeOrmModule.forFeature([
      User,
      EntityModel,
      EntityType,
      EntityField,
      FleetManager,
      BrowserGroupEntity,
      EntityFieldSchema,
      UserEntityAssignment,
    ]),
    forwardRef(() => EntityFieldsModule),
    forwardRef(() => EntityModule),
    forwardRef(() => EntityTypesModule),
    forwardRef(() => UserGlobalModule),
  ],
  providers: [
    PlantRepositoryService,
    PlantEventService,
    PlantStateService,
    PlantStatusService,
    PlantService,
    FleetManagerService,
    EntityTypeService,
    EntityService,
    EntityFieldService,
  ],
  exports: [
    PlantRepositoryService,
    PlantEventService,
    PlantStateService,
    PlantStatusService,
    PlantService,
    FleetManagerService,
    EntityTypeService,
    EntityService,
    EntityFieldService,
  ],
})
export class InsightModule {}
