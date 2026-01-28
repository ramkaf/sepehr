import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildJarghoyeh2Co2AllValueQuery = (
  date_histogram: IDateHistogram,
  range: IRangeQuery,
) => ({
  size: 0,
  query: {
    bool: {
      filter: [
        {
          range,
        },
        {
          term: {
            'DeviceName.keyword': 'SmartLogger',
          },
        },
      ],
    },
  },
  aggs: {
    by_date_interval: {
      date_histogram,
      aggs: {
        by_log_file_path: {
          terms: {
            field: 'log.file.path.keyword',
          },
          aggs: {
            average_co2: {
              max: {
                field: 'CO2_reduction',
              },
            },
          },
        },
      },
    },
  },
});
