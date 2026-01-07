import { IRangeQuery } from 'libs/interfaces';

export const buildEnergyTodayWithoutLossesDailyQuery = (
  deviceName: string,
  logFilePrefix: string,
  range: IRangeQuery,
) => ({
  size: 0,
  _source: ['E-Daily', 'DeviceName', 'DateTime'],
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
          source: `
               def path = doc['log.file.path.keyword'].value;
               def matcher = /\\\\([^\\\\]+)\\\\/.matcher(path);
               return matcher.find() ? matcher.group(1) : null;
             `,
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
            intervals: {
              date_histogram: {
                field: 'DateTime',
                fixed_interval: '1d',
                time_zone: 'Asia/Tehran',
              },
              aggs: {
                'E-Daily': {
                  max: {
                    field: 'E-Daily',
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
