// data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entities/user.entity';
import { EntityModel } from './entities/entity.entity';
import { BrowserGroupEntity } from './entities/browser-group.entity';
import { DocumentEntity } from './entities/document.entity';
import { CollectionEntity } from './entities/collection.entity';
import { AlarmConfig } from './entities/alarm-config.entity';
import { AlertConfigMessage } from './entities/alert-config-message.entity';
import { BookmarkField } from './entities/bookmark-field.entity';
import { EntityFieldCondition } from './entities/field-condition.entity';
import { EntityFieldsPeriod } from './entities/field-period.entity';
import { Soiling } from './entities/soiling.entity';
import { PlantMessage } from './entities/plant-message.entity';
import { AlarmCondition } from './entities/alarm-condition';
import { UserChart } from './entities/user-chart.entity';
import { ChartEntity } from './entities/chart-entity.entity';
import { DetailField } from './entities/detail-field.entity';
import { ChartDetail } from './entities/chart-detail.entity';
import { Chart } from './entities/charts.entity';
import { EntityField } from './entities/entity-field.entity';
import { FleetManager } from './entities/fleat-manager.entity';
import { EntityType } from './entities/entity-types.entity';
import { UserComponentsConfig } from './entities/components.entity';
import { Permission } from './entities/permissions.entity';
import { ApiLog } from './entities/log.entity';
import { Source } from './entities/sources.entity';
import {
  AccessType,
  AccessTypeSetting,
  DeviceMaintenance,
  EntityFieldSchema,
  EntityTypeFieldSetupStatus,
  PlantFieldVisibility,
  PrimaryKeyParameter,
  Role,
  Schematic,
  SettingSection,
  UserEntityAssignment,
} from './entities';
import { SchematicCategory } from './entities/schematic-category.entity';
import { Province } from './entities/province.entity';
import { PlantType } from './entities/plant-type.entity';
import { Company } from './entities/company.entity';
import { MediaResource } from './entities/media-resource.entity';
import { WarehouseDevice } from './entities/maintenance/warehouse-devices.entity';
import { MaintenanceStep } from './entities/maintenance/maintenance-step.entity';
import { MaintenanceHistory } from './entities/maintenance/maintenance-history';
import { Warranty } from './entities/maintenance/device-warranties.entity';
import { DeviceTagMapping } from './entities/maintenance/device-tag-mapping.entity';
import { DeviceSpec } from './entities/maintenance/device-spec.entity';
import { FleetManagerColumns } from './entities/fleet-manager-columns.entity';
import { UserFleetColumnsPreferences } from './entities/user-fleet-columns-preferences.entity';
import { CompanyWarehouse } from './entities/maintenance/company-warehouse.entity';
import { Specs } from './entities/maintenance/specs.entity';
import { SoilingEntityFields } from './entities/soiling-entity-fields.entity';
import { SoilingEntities } from './entities/soiling-entities.entity';
import { Settings } from 'luxon';

dotenv.config(); // Load .env values

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['POSTGRES_HOST'] || 'localhost',
  port: Number(process.env['POSTGRES_PORT']) || 5432,
  username: process.env['POSTGRES_USER'] || 'postgres',
  password: process.env['POSTGRES_PASSWORD'] || 'postgres',
  database: process.env['POSTGRES_DB'] || 'postgres',
  synchronize: false, // set true only for dev
  logging: true,
  migrations: ['libs/database/src/postgresql/migrations/**/*.ts'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  entities: [
    SchematicCategory,
    AccessType,
    SettingSection,
    Settings,
    AccessTypeSetting,
    Role,
    Permission,
    User,
    ApiLog,
    Permission,
    UserComponentsConfig,
    EntityType,
    EntityModel,
    Source,
    FleetManager,
    EntityField,
    Chart,
    ChartDetail,
    DetailField,
    ChartEntity,
    UserChart,
    AlarmCondition,
    PlantMessage,
    Soiling,
    EntityFieldsPeriod,
    EntityFieldCondition,
    BookmarkField,
    AlertConfigMessage,
    AlarmConfig,
    CollectionEntity,
    DocumentEntity,
    BrowserGroupEntity,
    EntityFieldSchema,
    PlantFieldVisibility,
    EntityTypeFieldSetupStatus,
    UserEntityAssignment,
    Schematic,
    SoilingEntities,
    SoilingEntityFields,
    Province,
    PlantType,
    Company,
    MediaResource,
    MaintenanceStep,
    MaintenanceHistory,
    Warranty,
    DeviceTagMapping,
    Specs,
    DeviceSpec,
    FleetManagerColumns,
    UserFleetColumnsPreferences,
    CompanyWarehouse,
    DeviceMaintenance,
    PrimaryKeyParameter,
  ],
});
