import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ELASTIC_CLIENT } from '../constants/elastic.constants';
import { buildLatestDeviceFieldElasticQuery } from '../queries/common-queries/device-field-last-value.query';
import { isNull } from 'util';

@Injectable()
export class ElasticService {
  constructor(@Inject(ELASTIC_CLIENT) private readonly elasticClient: Client) {}

  getClient(): Client {
    return this.elasticClient;
  }

  async search(index: string, body: any): Promise<any> {
    try {
      const response = await this.elasticClient.search({
        index,
        body,
      });
      return response;
    } catch (error) {
      const e = error as Error;
      throw new InternalServerErrorException(
        `Elasticsearch search error: ${e.message}`,
      );
    }
  }

  async multiSearch(index: string, searches: any[]): Promise<any> {
    try {
      if (!searches || searches.length === 0) {
        throw new BadRequestException('No search queries provided');
      }

      // Build the multi-search body format
      const body = searches.flatMap((search) => [{ index }, search]);

      const response = await this.elasticClient.msearch({
        body,
      });

      return response;
    } catch (error) {
      const e = error as Error;
      throw new InternalServerErrorException(
        `Elasticsearch multi-search error: ${e.message}`,
      );
    }
  }

  async doesIndexExist(index: string): Promise<boolean> {
    const response = (await this.elasticClient.transport.request({
      method: 'GET',
      path: `/_resolve/index/${index}`,
    })) as { indices: { name: string }[] };

    const { indices } = response;
    return Array.isArray(indices) && indices.length > 0 ? true : false;
  }

  async fetchDeviceParameterLatestValue(
    index: string,
    device: string,
    parameter: string,
  ) {
    try {
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'PV Temp',
        'PV_temp',
      );
      const result = await this.search(index, elasticQuery);
      return result.hits.hits[0]._source[`${parameter}`];
    } catch (error) {
      return null;
    }
  }
  async fetchDeviceParameterTodayLastValue(
    index: string,
    device: string,
    parameter: string,
  ) {
    const body = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              term: {
                'DeviceName.keyword': device,
              },
            },
          ],
        },
      },
      aggs: {
        current_value: {
          top_hits: {
            size: 1,
            sort: [
              {
                DateTime: {
                  order: 'desc',
                },
              },
            ],
            _source: {
              includes: [parameter, 'DeviceName', 'DateTime'],
            },
          },
        },
        today_midnight: {
          filter: {
            range: {
              DateTime: {
                gte: 'now/d',
                lt: 'now/d+1d',
              },
            },
          },
          aggs: {
            first_after_midnight: {
              top_hits: {
                size: 1,
                sort: [
                  {
                    DateTime: {
                      order: 'asc',
                    },
                  },
                ],
                _source: {
                  includes: [parameter, 'DeviceName', 'DateTime'],
                },
              },
            },
          },
        },
      },
    };
    const response = await this.search(index, body);
    const currentValue =
      response.aggregations.current_value.hits.hits[0]._source[parameter] ??
      null;
    const Date =
      response.aggregations.current_value.hits.hits[0]._source['DateTime'] ??
      null;
    const midnightValue =
      response.aggregations.today_midnight.first_after_midnight.hits.hits[0]
        ._source[parameter] ?? null;
    if (!midnightValue || !currentValue) return { result: null, Date: null };
    return { result: currentValue - midnightValue, Date };
  }
}
