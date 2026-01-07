import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildJarghoyeh2HvEnergyImportAllValueQuery = (
  meterEntityTag: string,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
) => ({
  _source: ['Energy_imp._Total', 'DateTime'],
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
            field: 'Energy_imp._Total',
          },
        },
      },
    },
  },
});
