import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildIonEnergyTodayWithoutLossesMonthlyAndYearlyQuery = (
  deviceName: string,
  logFilePrefix: string,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
) => ({
  size: 0,
  query: {
    bool: {
      must: [
        {
          match: {
            'DeviceName.keyword': deviceName,
          },
        },
        {
          wildcard: {
            'log.file.path.keyword': logFilePrefix,
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
        by_year: {
          date_histogram: date_histogram,
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
                  includes: ['AC_energy_fed_in', 'DateTime', 'DeviceName'],
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
                  includes: ['AC_energy_fed_in', 'DateTime', 'DeviceName'],
                },
              },
            },
          },
        },
      },
    },
  },
});
