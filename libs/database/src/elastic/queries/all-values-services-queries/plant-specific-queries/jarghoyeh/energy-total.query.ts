import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildJarghoyeh2HvEnergyTotalAllValueQuery = (
  meterEntityTag: string,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
) => ({
  body: {
    _source: ['Energy_exp._Total', 'DateTime'],
    sort: [
      {
        DateTime: {
          order: 'desc', // Sort by timestamp in descending order to get the last record
        },
      },
    ],
    query: {
      bool: {
        must: [
          {
            terms: {
              'DeviceName.keyword': [meterEntityTag],
            },
          },
          {
            range,
          },
        ],
      },
    },
    aggs: {
      energy_over_time: {
        date_histogram,
        aggs: {
          max_energy: {
            max: {
              field: 'Energy_exp._Total',
            },
          },
        },
      },
    },
  },
});
