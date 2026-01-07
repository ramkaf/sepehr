import { Module } from '@nestjs/common';
import { RbacModule } from '../../rbac/rbac.module';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './provider/admin.service';
import { EntityFieldController } from './controller/entity-fields.controller';
import { EntityController } from './controller/entity.controller';
import { EntityTypeController } from './controller/entity-types.controller';
import { SettingController } from './controller/setting.controller';
import { RoleController } from './controller/role.controller';
import { UserManagmentController } from './controller/user-managment.controller';
import { SourceController } from './controller/source.controller';
import { ChartController } from './controller/charts.controller';
import { ChartDetailController } from './controller/chart-detail.controller';
import { ChartDetailFieldController } from './controller/chart-detail-fields.controller';
import { UserManagmentService } from './provider/user-managment.service';
import { UserModule } from '../../user/user.module';
import { AlarmConfigController } from './controller/alarm-config.controller';
import { ChartEntityController } from './controller/chart-entity.controller';
import { TestController } from './controller/test.controller';
import { BrowserModule } from '../../dashboard/browser/browser.module';
import { InitPlantModule } from '../init-plant/init-plant.module';
import { NestConfigModule } from 'libs/config';
import {
  ADMIN_DASHBOARD_RABBITMQ_QUEUE,
  ADMIN_DASHBOARD_RABBITMQ_SERVICE,
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';
import {
  AlarmConfigsModule,
  ChartDetailFieldsModule,
  ChartDetailModule,
  ChartEntityModule,
  ChartsModule,
  EntityFieldsModule,
  EntityModule,
  EntityTypesModule,
  InsightModule,
  PowerPlantServiceModule,
  SettingModule,
  SourceModule,
  UserGlobalModule,
} from 'libs/modules';
import { ElasticModule, PostgresModule, RedisModule } from 'libs/database';
@Module({
  imports: [
    NestConfigModule,
    InitPlantModule,
    RabbitMQModule.register([
      {
        name: NOTIFICATION_RABBITMQ_SERVICE,
        queue: NOTIFICATION_RABBITMQ_QUEUE,
      },
      {
        name: ADMIN_DASHBOARD_RABBITMQ_SERVICE,
        queue: ADMIN_DASHBOARD_RABBITMQ_QUEUE,
      },
    ]),
    AlarmConfigsModule,
    EntityTypesModule,
    EntityFieldsModule,
    EntityModule,
    ChartsModule,
    ChartDetailModule,
    ChartDetailFieldsModule,
    ChartEntityModule,
    RbacModule,
    RedisModule,
    PostgresModule,
    ElasticModule.register(),
    SettingModule,
    UserGlobalModule,
    UserModule,
    SourceModule,
    InsightModule,
    PowerPlantServiceModule,
    BrowserModule,
  ],
  controllers: [
    AdminController,
    EntityFieldController,
    EntityController,
    EntityTypeController,
    AlarmConfigController,
    RoleController,
    SettingController,
    UserManagmentController,
    SourceController,
    ChartController,
    ChartDetailController,
    ChartDetailFieldController,
    ChartEntityController,
    SettingController,
    TestController,
  ],
  providers: [AdminService, UserManagmentService],
  exports: [AdminService],
})
export class AdminPanelModule {}
