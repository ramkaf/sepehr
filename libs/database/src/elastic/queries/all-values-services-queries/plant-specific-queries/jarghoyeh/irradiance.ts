import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildJarghoyeh2IrradianceAllValueQuery = (
  range: IRangeQuery,
  date_histogram: IDateHistogram,
) => {
  return {
    size: 0,
    _source: ['Total_irradiance', 'DateTime'],
    query: {
      bool: {
        filter: [
          {
            range,
          },
          {
            match_phrase: {
              'DeviceName.keyword': 'Irradiation',
            },
          },
          {
            match_phrase: {
              'log.file.path': 'WS-01',
            },
          },
        ],
      },
    },
    aggs: {
      intervals: {
        date_histogram,
        aggs: {
          irradiance: {
            avg: {
              script: {
                source:
                  "if (doc['DeviceName.keyword'].value == 'Irradiation') { if (doc['Total_irradiance'].size() > 0 && doc['Total_irradiance'].value>0) { return doc['Total_irradiance'].value; } } return null;",
              },
            },
          },
        },
      },
    },
  };
};
