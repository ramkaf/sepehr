import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeviceMaintenance,
  DeviceSpec,
  DeviceTagMapping,
  ElasticModule,
  MaintenanceHistory,
  MaintenanceStep,
  MediaResource,
  PostgresModule,
  RedisModule,
  Spec,
  Warranty,
} from 'libs/database';
import { MaintenanceStepService } from './providers/maintenance-step.service';
import { MaintenanceDeviceService } from './providers/maintenance-device.service';
import { EntityFieldsModule } from '../entity-fields/entity-fields.module';
import { MaintenanceDevicesTagMappingService } from './providers/maintenance-device-tag-mapping.service';
import { InsightModule } from '@app/modules/insight';
import { MaintenanceService } from './providers/maintenance.service';
import { MaintenanceHistoryService } from './providers/maintenance-history.service';
import { MaintenanceDeviceSpecService } from './providers/maintenance-device-spec.service';
import { MaintenanceSpecService } from './providers/maintenance-spec.service';
import { MaintenanceWarrantiesService } from './providers/maintenance-warranties.service';
import { UserGlobalModule } from '../users/userGlobal.module';
import { EntityTypesModule } from '../entity-types/entity-types.module';
import { MediaResourceModule } from '../media-resource/media-resource.module';
import { EntityModule } from '../entity/entity.module';
import { CompanyModule } from '../company/company.module';
import { NestConfigModule } from 'libs/config';

@Module({
  imports: [
    NestConfigModule,
    PostgresModule,
    RedisModule,
    ElasticModule.register(),
    TypeOrmModule.forFeature([
      Spec,
      MaintenanceStep,
      DeviceMaintenance,
      MaintenanceHistory,
      DeviceTagMapping,
      DeviceSpec,
      EntityTypesModule,
      Warranty,
    ]),
    EntityFieldsModule,
    EntityTypesModule,
    forwardRef(() => InsightModule),
    UserGlobalModule,
    MediaResourceModule,
    EntityModule,
    CompanyModule,
  ],
  providers: [
    MaintenanceStepService,
    MaintenanceDeviceService,
    MaintenanceDevicesTagMappingService,
    MaintenanceService,
    MaintenanceHistoryService,
    MaintenanceDeviceSpecService,
    MaintenanceSpecService,
    MaintenanceWarrantiesService,
  ],
  exports: [
    MaintenanceStepService,
    MaintenanceDeviceService,
    MaintenanceDevicesTagMappingService,
    MaintenanceService,
    MaintenanceHistoryService,
    MaintenanceDeviceSpecService,
    MaintenanceSpecService,
    MaintenanceWarrantiesService,
  ],
})
export class MaintenanceModule {}
