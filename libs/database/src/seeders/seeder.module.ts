import { forwardRef, Logger, Module, OnModuleInit } from '@nestjs/common';
import {
  AlarmConfig,
  AlertConfigMessage,
  BookmarkField,
  BrowserGroupEntity,
  Chart,
  ChartDetail,
  ChartEntity,
  CollectionEntity,
  DetailField,
  DocumentEntity,
  EntityField,
  EntityFieldCondition,
  EntityFieldsPeriod,
  EntityModel,
  EntityType,
  FleetManager,
  Permission,
  PlantMessage,
  PostgresModule,
  Role,
  Soiling,
  Source,
  User,
  UserChart,
  UserComponentsConfig,
  AccessType,
  Settings,
  SettingSection,
  EntityFieldSchema,
} from '../postgresql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityTypeSeeder } from './optional-seeder/entity-type.seeder.service';
import { EntityModelSeeder } from './optional-seeder/entity.seeder.service';
import { EntityFieldSeeder } from './optional-seeder/entity-field.seeder.service';
import { AlarmConfigSeeder } from './optional-seeder/alarm-config.seeder.service';
import { BrowserGroupSeeder } from './optional-seeder/browser-group.seeder.service';
import { PlantMessageSeeder } from './optional-seeder/plant-message.seeder.service';
import { SourceSeeder } from './optional-seeder/sources.seeder.service';
import { AlertConfigMessageSeeder } from './optional-seeder/alert-config-message.seeder.service';
import { DocumentSeeder } from './optional-seeder/document.seeder.service';
import { UserSeeder } from './important-seeder/users.seeder.service';
import { EntityFieldsPeriodSeeder } from './optional-seeder/field-period.seeder.service';
import { BookmarkFieldSeeder } from './optional-seeder/bookmark-field.seeder.service';
import { ChartSeeder } from './optional-seeder/charts.seeder.service';
import { ChartDetailSeeder } from './optional-seeder/chart-details.seeder.service';
import { ChartEntitySeeder } from './optional-seeder/chart-entities.seeder.service';
import { DetailFieldSeeder } from './optional-seeder/details_fields.seeder.service';
import { SoilingSeeder } from './optional-seeder/soiling.seeder.service';
import { SoilingEntitiesSeeder } from './optional-seeder/soiling-entities.seeder.service';
import { SoilingEntityFieldSeeder } from './optional-seeder/soiling-entitiy-fields.seeder.service';
import { PermissionSeeder } from './important-seeder/permissions.seeder.service';
import { UserComponentConfigSeeder } from './optional-seeder/user-component-config.seeder.service';
import { UserChartSeeder } from './optional-seeder/user-charts.seeder.service';
import { FleatManagerSeeder } from './optional-seeder/fleat-manager.seeder.service';
import { EntityFieldConditionSeeder } from './optional-seeder/entity-field-condition.seeder.service';
import { CollectionParamSeeder } from './optional-seeder/collection-params.seeder.service';
import { CollectionSeeder } from './optional-seeder/collection.seeder.service';
import { RolePermissionSeeder } from './important-seeder/role-permission.service';
import { AccessTypeSeeder } from './important-seeder/access-type.seeder.service';
import { RoleSeeder } from './important-seeder/role.seeder.service';
import { SettingSectionSeeder } from './important-seeder/setting-section.seeder.service';
import { SettingSeeder } from './important-seeder/setting.seeder.service';
import { AccessTypeSettingSeeder } from './important-seeder/access-type-setting.seeder.service';
import { ImportantSeederService } from './important-seeder.service';
import { OptionalSeederService } from './optional-seeder.service';
import { EntityFieldSchemaSeeder } from './important-seeder/entity-field-schema.seeder.service';

@Module({
  imports: [
    forwardRef(() => PostgresModule),
    TypeOrmModule.forFeature([
      AccessType,
      SettingSection,
      Settings,
      Role,
      EntityType,
      EntityModel,
      EntityField,
      BrowserGroupEntity,
      AlarmConfig,
      PlantMessage,
      Source,
      AlertConfigMessage,
      DocumentEntity,
      User,
      EntityFieldsPeriod,
      BookmarkField,
      Chart,
      ChartDetail,
      ChartEntity,
      DetailField,
      Soiling,
      Permission,
      UserComponentsConfig,
      UserChart,
      FleetManager,
      EntityFieldCondition,
      CollectionEntity,
      EntityFieldSchema,
    ]),
  ],
  providers: [
    AccessTypeSeeder,
    SettingSectionSeeder,
    SettingSeeder,
    AccessTypeSettingSeeder,
    RoleSeeder,
    PermissionSeeder,
    RolePermissionSeeder,
    EntityTypeSeeder,
    EntityModelSeeder,
    EntityFieldSeeder,
    AlarmConfigSeeder,
    BrowserGroupSeeder,
    PlantMessageSeeder,
    SourceSeeder,
    AlertConfigMessageSeeder,
    DocumentSeeder,
    UserSeeder,
    EntityFieldsPeriodSeeder,
    BookmarkFieldSeeder,
    ChartSeeder,
    ChartDetailSeeder,
    ChartEntitySeeder,
    DetailFieldSeeder,
    SoilingSeeder,
    SoilingEntitiesSeeder,
    SoilingEntityFieldSeeder,
    PermissionSeeder,
    UserComponentConfigSeeder,
    UserChartSeeder,
    FleatManagerSeeder,
    EntityFieldConditionSeeder,
    CollectionSeeder,
    CollectionParamSeeder,
    EntityFieldSchemaSeeder,
    ImportantSeederService,
    OptionalSeederService,
  ],
  exports: [ImportantSeederService, OptionalSeederService],
})
export class SeederModule implements OnModuleInit {
  private readonly logger = new Logger(SeederModule.name);

  constructor(
    private readonly importantSeederService: ImportantSeederService,
    private readonly optionalSeederService: OptionalSeederService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Starting important data seeding...');
      await this.importantSeederService.seedImportant();
      await this.optionalSeederService.seedOptional();
      this.logger.log('Important data seeding completed successfully');
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      throw error;
    }
  }
}
