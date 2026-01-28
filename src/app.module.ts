import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ElasticModule, PostgresModule } from 'libs/database';
import {
  ADMIN_DASHBOARD_RABBITMQ_QUEUE,
  ADMIN_DASHBOARD_RABBITMQ_SERVICE,
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';
import {
  ApiLoggerService,
  ResponseFormatterService,
  ResponseInterceptor,
} from 'libs/logger';
import { ExcludeSensitiveKeysInterceptor } from 'libs/interceptors';
import { ThrottlerExceptionFilter } from 'libs/filters';
import { AdminModule } from './admin/admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RbacModule } from './rbac/rbac.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SchematicModule } from './schematic/schematic.module';
import { NestConfigModule } from 'libs/config';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NestConfigModule,
    PostgresModule,
    ElasticModule.register(),
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
    AdminModule,
    DashboardModule,
    RbacModule,
    UserModule,
    AuthModule,
    SchematicModule,
    NotificationModule,
  ],
  providers: [
    ApiLoggerService,
    ResponseFormatterService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ExcludeSensitiveKeysInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
