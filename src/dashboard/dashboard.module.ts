import { Module } from '@nestjs/common';
import { BrowserModule } from './browser/browser.module';
import { MaintenanceGetWayModule } from './maintenance/maintenance.module';
import {
  ADMIN_DASHBOARD_RABBITMQ_QUEUE,
  ADMIN_DASHBOARD_RABBITMQ_SERVICE,
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';

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
    BrowserModule,
    MaintenanceGetWayModule,
  ],
  providers: [],
})
@Module({})
export class DashboardModule {}
