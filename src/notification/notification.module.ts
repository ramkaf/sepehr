import { Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';
import { SmtpMailerModule } from './mailer/mailer.module';
import {
  ADMIN_DASHBOARD_RABBITMQ_QUEUE,
  ADMIN_DASHBOARD_RABBITMQ_SERVICE,
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';
import { NestConfigModule } from 'libs/config';
@Module({
  imports: [
    NestConfigModule,
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
    SmsModule,
    SmtpMailerModule,
  ],
})
export class NotificationModule {}
