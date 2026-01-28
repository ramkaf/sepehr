import { Module } from '@nestjs/common';
import { InitPlantService } from './providers/init-plant.service';
import { RevertInitPlantService } from './providers/revert-init-plant.service';
import { InitPlantController } from './controllers/init-plant.controller';
import { RevertInitPlantContrller } from './controllers/revert-init-plant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CompanyModule,
  EntityFieldsModule,
  EntityModule,
  EntityTypesModule,
  InsightModule,
  PlantTypeModule,
  ProvinceModule,
  SourceModule,
} from 'libs/modules';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { RbacModule } from '../../rbac/rbac.module';
import { UserModule } from '../../user/user.module';
import {
  ElasticModule,
  EntityField,
  EntityModel,
  EntityType,
  FleetManager,
  PostgresModule,
  RedisModule,
  Source,
} from 'libs/database';
import { ApiLoggerService, ResponseFormatterService } from 'libs/logger';
import { HttpExceptionFilter, ThrottlerExceptionFilter } from 'libs/filters';
// import { CustomThrottlerGuard } from '@app/guards';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PostgresModule,
    ElasticModule.register(),
    RedisModule,
    TypeOrmModule.forFeature([
      EntityModel,
      EntityField,
      EntityType,
      Source,
      FleetManager,
    ]),
    EntityModule,
    EntityTypesModule,
    EntityFieldsModule,
    RbacModule,
    InsightModule,
    UserModule,
    SourceModule,
    CompanyModule,
    ProvinceModule,
    PlantTypeModule,
  ],
  controllers: [InitPlantController, RevertInitPlantContrller],
  providers: [
    ResponseFormatterService,
    ApiLoggerService,
    InitPlantService,
    RevertInitPlantService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard,
    // },
  ],
  exports: [InitPlantService, RevertInitPlantService],
})
export class InitPlantModule {}
