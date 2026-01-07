import { IRangeQuery } from 'libs/interfaces';

export const buildEnergyTodayWithLossesMonthlyQuery = (
  deviceName: string,
  range: IRangeQuery,
  engParameter: string,
) => ({
  size: 0,
  query: {
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
          range,
        },
      ],
    },
  },
  aggs: {
    by_device: {
      terms: {
        field: 'DeviceName.keyword',
        size: 10,
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
                  includes: [engParameter, 'DateTime', 'DeviceName'],
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
                  includes: [engParameter, 'DateTime', 'DeviceName'],
                },
              },
            },
          },
        },
      },
    },
  },
});
