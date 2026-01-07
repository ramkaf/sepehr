import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { ElasticService } from './providers/elastic.service';
import { ELASTIC_CLIENT } from './constants/elastic.constants';
import { ElasticModuleOptions } from './interfaces/elastic.interfaces';
import * as fs from 'fs';
import * as path from 'path';

@Global()
@Module({})
export class ElasticModule {
  static register(options?: Partial<ElasticModuleOptions>): DynamicModule {
    const elasticProvider: Provider = {
      provide: ELASTIC_CLIENT,
      useFactory: () => {
        if (options?.client) {
          return options.client;
        }

        const { Client } = require('@elastic/elasticsearch');

        const certificatePath = path.resolve(process.cwd(), 'ca.crt');
        const username = process.env['ELASTIC_USERNAME'];
        const password = process.env['ELASTIC_PASSWORD'];
        const node = process.env['ELASTIC_NODE'];
        const ca = fs.readFileSync(certificatePath);
        return new Client({
          node,
          auth: {
            username,
            password,
          },
          tls: {
            ca,
            rejectUnauthorized: false,
          },
        });
      },
    };

    return {
      module: ElasticModule,
      providers: [elasticProvider, ElasticService],
      exports: [ElasticService],
    };
  }
}
