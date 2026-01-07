import { IRangeQuery } from 'libs/interfaces';

export const buildIonMeterEnergyTodayDailyQuery = (
  range: IRangeQuery,
  engType: string,
) => ({
  size: 0,
  query: {
    bool: {
      must: [
        {
          terms: {
            'DeviceName.keyword': ['ION METER'],
          },
        },
        {
          range: range,
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
        by_day: {
          date_histogram: {
            field: 'DateTime',
            fixed_interval: '1d',
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
                  includes: [engType, 'DateTime', 'DeviceName'],
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
                  includes: [engType, 'DateTime', 'DeviceName'],
                },
              },
            },
          },
        },
      },
    },
  },
});
