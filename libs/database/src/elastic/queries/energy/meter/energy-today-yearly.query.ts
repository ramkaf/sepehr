import { IRangeQuery } from 'libs/interfaces';

export const buildMeterEnergyTodayYearlyQuery = (
  range: IRangeQuery,
  engParameter: string,
) => ({
  size: 0,
  query: {
    bool: {
      must: [
        {
          terms: {
            'DeviceName.keyword': [
              'HV1 POWER METER OUT 2',
              'HV1 POWER METER OUT 1',
            ],
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
        by_year: {
          date_histogram: {
            field: 'DateTime',
            calendar_interval: 'year',
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
