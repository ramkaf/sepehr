import { IRangeQuery } from 'libs/interfaces';

export const buildEnergyTodayWithoutLossesMonthlyQuery = (
  deviceName: string,
  logFilePrefix: string,
  range: IRangeQuery,
) => ({
  size: 0,
  _source: ['E-Total', 'DeviceName', 'DateTime'],
  query: {
    bool: {
      must: [
        {
          range,
        },
        {
          bool: {
            must: [
              {
                prefix: {
                  'DeviceName.keyword': {
                    value: deviceName,
                  },
                },
              },
              {
                wildcard: {
                  'log.file.path.keyword': logFilePrefix,
                },
              },
            ],
          },
        },
      ],
    },
  },
  aggs: {
    by_sub: {
      terms: {
        script: {
          source: "doc['log.file.path.keyword'].value.substring(2, 7)",
          lang: 'painless',
        },
      },
      aggs: {
        by_device: {
          terms: {
            field: 'DeviceName.keyword',
            size: 23,
          },
          aggs: {
            by_month: {
              date_histogram: {
                field: 'DateTime',
                calendar_interval: 'month',
                time_zone: '+03:30',
              },
              aggs: {
                first_value: {
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
                      includes: ['E-Total', 'DateTime', 'DeviceName'],
                    },
                  },
                },
                last_value: {
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
                      includes: ['E-Total', 'DateTime', 'DeviceName'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
