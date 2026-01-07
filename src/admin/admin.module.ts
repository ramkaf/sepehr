import { Module } from '@nestjs/common';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { InitPlantModule } from './init-plant/init-plant.module';
import { APP_GUARD } from '@nestjs/core';
import {
  ADMIN_DASHBOARD_RABBITMQ_QUEUE,
  ADMIN_DASHBOARD_RABBITMQ_SERVICE,
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';
import { AdminGuard } from 'libs/guards';

@Module({
  imports: [
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
    AdminPanelModule,
    InitPlantModule,
  ],
  providers: [
    {
      useClass: AdminGuard,
      provide: APP_GUARD,
    },
  ],
})
export class AdminModule {}
