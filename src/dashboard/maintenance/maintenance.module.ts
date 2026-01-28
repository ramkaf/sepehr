import { Module } from '@nestjs/common';
import { CompanyController } from './controllers/company.controller';
import { WareHouseDeviceController } from './controllers/warehouse-device.controller';
import { CompanyWareHouseController } from './controllers/company-warehouse.controller';
import {
  CompanyModule,
  CompanyWareHouseModule,
  EntityModule,
  MaintenanceModule,
  UserGlobalModule,
  WarehouseDevicesModules,
} from 'libs/modules';
import { MaintenanceStepsController } from './controllers/steps.controller';
import { WarrantyController } from './controllers/warranties.controller';
import { SpecController } from './controllers/spec.controller';
import { DeviceSpecController } from './controllers/device-spec.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/rbac/guards/permission.guard';
import { NestConfigModule } from 'libs/config';
import { ElasticModule, PostgresModule, RedisModule } from 'libs/database';
import { RbacModule } from 'src/rbac/rbac.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    NestConfigModule,
    PostgresModule,
    RedisModule,
    ElasticModule.register(),
    CompanyModule,
    CompanyWareHouseModule,
    WarehouseDevicesModules,
    MaintenanceModule,
    UserModule,
    RbacModule,
  ],
  controllers: [
    MaintenanceStepsController,
    WareHouseDeviceController,
    CompanyWareHouseController,
    CompanyController,
    WarrantyController,
    SpecController,
    DeviceSpecController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class MaintenanceGetWayModule {}
