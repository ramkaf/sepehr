import { IRangeQuery } from 'libs/interfaces';

export const buildEnergyTodayWithLossesCustomQuery = (
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
    midnightValues: {
      terms: {
        field: 'DeviceName.keyword',
        size: 10,
      },
      aggs: {
        by_day: {
          date_histogram: {
            field: 'DateTime',
            fixed_interval: '1d',
            time_zone: '+03:30',
          },
          aggs: {
            first_energy_value: {
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
          },
        },
      },
    },
    avgEnergies: {
      terms: {
        field: 'DeviceName.keyword',
        size: 10,
      },
      aggs: {
        by_custom: {
          date_histogram: {
            field: 'DateTime',
            fixed_interval: '15m',
            time_zone: '+03:30',
          },
          aggs: {
            avg_energy: {
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
