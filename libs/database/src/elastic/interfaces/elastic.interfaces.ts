import { Client } from '@elastic/elasticsearch';

export interface ElasticModuleOptions {
  client: Client;
}
