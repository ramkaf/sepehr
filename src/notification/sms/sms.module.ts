import { Module } from '@nestjs/common';
import { SmsTemplateService } from './providers/sms-template.service';
import { SmsDeliveryService } from './providers/sms-delivery.service';
import { SmsMicroserviceController } from './controllers/sms.controller';
import { NestConfigModule } from 'libs/config';
import {
  ADMIN_DASHBOARD_RABBITMQ_QUEUE,
  ADMIN_DASHBOARD_RABBITMQ_SERVICE,
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';

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
  ],
  controllers: [SmsMicroserviceController],
  exports: [SmsTemplateService],
  providers: [SmsTemplateService, SmsDeliveryService],
})
export class SmsModule {}
