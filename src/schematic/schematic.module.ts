import { Module } from '@nestjs/common';
import { SchematicService } from './providers/schematic.service';
import { BrowserModule } from '../dashboard/browser/browser.module';
import { SchematicDashboardController } from './controllers/schematic-dashboard.controller';
import { SchematicAdminController } from './controllers/schematic-admin.controller';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { UserModule } from '../user/user.module';
import {
  EntityModel,
  EntityType,
  PostgresModule,
  RedisModule,
  Schematic,
  SchematicCategory,
} from 'libs/database';
import { EntityModule, InsightModule, UserGlobalModule } from 'libs/modules';
import { ResponseFormatterService } from 'libs/logger';
import { HttpExceptionFilter, ThrottlerExceptionFilter } from 'libs/filters';
import { NestConfigModule } from 'libs/config';
// import { CustomThrottlerGuard } from 'libs/guards';
@Module({
  imports: [
    NestConfigModule,
    TypeOrmModule.forFeature([
      SchematicCategory,
      Schematic,
      EntityType,
      EntityModel,
    ]),
    PostgresModule,
    RedisModule,
    RbacModule,
    UserGlobalModule,
    UserModule,
    EntityModule,
    EntityModule,
    BrowserModule,
    InsightModule,
  ],
  controllers: [SchematicDashboardController, SchematicAdminController],
  providers: [
    ResponseFormatterService,
    SchematicService,
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
  exports: [SchematicService],
})
export class SchematicModule {}
