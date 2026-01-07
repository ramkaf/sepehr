import { DynamicModule, Module } from '@nestjs/common';
import {
  ClientsModule,
  Transport,
  RmqOptions,
  ClientProviderOptions,
} from '@nestjs/microservices';
import { RABBITMQ_URL } from './constants';

export interface RabbitMQConfig {
  name: string;
  queue: string;
  url?: string;
}

@Module({})
export class RabbitMQModule {
  static register(queues: RabbitMQConfig[]): DynamicModule {
    const clients: ClientProviderOptions[] = queues.map((q) => ({
      name: q.name,
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: q.queue,
        queueOptions: {
          durable: false,
        },
      },
    }));

    return {
      module: RabbitMQModule,
      imports: [ClientsModule.register(clients)],
      exports: [ClientsModule],
    };
  }
}
