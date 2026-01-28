import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildIrradianceAllValueQuery = (
  devices: string[],
  irradiationParameter: string,
  range: IRangeQuery,
  date_histogram: IDateHistogram,
) => {
  const scriptConditions = devices
    .map((d) => `doc['DeviceName.keyword'].value == '${d}'`)
    .join(' || ');

  return {
    size: 0,
    _source: [irradiationParameter, 'DateTime'],
    query: {
      bool: {
        must: [
          {
            terms: {
              'DeviceName.keyword': devices,
            },
          },
          {
            range, // you can fill in your range filter dynamically
          },
        ],
      },
    },
    aggs: {
      intervals: {
        date_histogram, // also can be filled later dynamically
        aggs: {
          irradiance: {
            avg: {
              script: {
                source: `
                  if (${scriptConditions}) {
                    if (
                      doc['${irradiationParameter}'].size() > 0 &&
                      doc['${irradiationParameter}'].value > 0
                    ) {
                      return doc['${irradiationParameter}'].value;
                    }
                  }
                  return null;
                `,
              },
            },
          },
        },
      },
    },
  };
};
