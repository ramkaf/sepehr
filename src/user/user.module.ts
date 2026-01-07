import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './providers/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module';
import { PasswordService } from './providers/password.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { NestConfigModule } from 'libs/config';
import { PostgresModule, RedisModule, User } from 'libs/database';
import { SettingModule, UserGlobalModule } from 'libs/modules';
import {
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';
import { ApiLoggerService, ResponseFormatterService } from 'libs/logger';
import { HttpExceptionFilter, ThrottlerExceptionFilter } from 'libs/filters';
// import { CustomThrottlerGuard } from '@app/guards';

@Module({
  imports: [
    NestConfigModule,
    PostgresModule,
    UserGlobalModule,
    SettingModule,
    RabbitMQModule.register([
      {
        name: NOTIFICATION_RABBITMQ_SERVICE,
        queue: NOTIFICATION_RABBITMQ_QUEUE,
      },
    ]),
    TypeOrmModule.forFeature([User]),
    RedisModule,
    forwardRef(() => RbacModule),
  ],
  providers: [
    ResponseFormatterService,
    ApiLoggerService,
    UserService,
    PasswordService,
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
  exports: [PasswordService, UserService],
})
export class UserModule {}
