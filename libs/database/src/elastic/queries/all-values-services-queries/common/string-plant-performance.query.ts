import { MaskFunctionsEnum } from 'libs/enums';

export const buildPlantPerformanceAllValueQuery = (
  nominalPower: string,
  date_histogram: any,
  range: any,
  irradiationDevices: string[],
  irradiationParameter: string,
  maskFunction: MaskFunctionsEnum | null,
  powerDevices: string[],
  dcToAcMax: string,
  powerParameter = 'P_total',
) => {
  // Choose condition for powerParameter dynamically
  const powerCondition =
    maskFunction === MaskFunctionsEnum.ReLU
      ? `doc['${powerParameter}'].size() > 0 && doc['${powerParameter}'].value > 0`
      : `doc['${powerParameter}'].size() > 0 && doc['${powerParameter}'].value < 0`;

  return {
    size: 0,
    _source: [irradiationParameter, powerParameter, 'DateTime'],
    query: {
      bool: {
        must: [
          {
            terms: {
              'DeviceName.keyword': [...irradiationDevices, ...powerDevices],
            },
          },
          { range },
        ],
      },
    },
    aggs: {
      intervals: {
        date_histogram,
        aggs: {
          max_irradiance: {
            avg: {
              script: {
                source: `
                  if (${irradiationDevices
                    .map(
                      (dev, i) =>
                        `${
                          i > 0 ? '||' : ''
                        } doc['DeviceName.keyword'].value == '${dev}'`,
                    )
                    .join(' ')}
                  ) {
                    if (doc['${irradiationParameter}'].size() > 0 && doc['${irradiationParameter}'].value > 0) {
                      return doc['${irradiationParameter}'].value;
                    }
                  }
                  return null;
                `,
              },
            },
          },
          max_abs_ptotal: {
            avg: {
              script: {
                source: `
                  if (${powerDevices
                    .map(
                      (dev, i) =>
                        `${
                          i > 0 ? '||' : ''
                        } doc['DeviceName.keyword'].value == '${dev}'`,
                    )
                    .join(' ')}
                  ) {
                    if (${powerCondition}) {
                      return Math.abs(doc['${powerParameter}'].value);
                    }
                  }
                  return null;
                `,
              },
            },
          },
          performance: {
            bucket_script: {
              buckets_path: {
                ptotal: 'max_abs_ptotal',
                irradiance: 'max_irradiance',
              },
              script: `
                if (params.ptotal > 0) {
                  return (params.ptotal * 100000) / ((${nominalPower} / ${dcToAcMax})  * params.irradiance);
                } else {
                  return 0;
                }
              `,
            },
          },
        },
      },
    },
  };
};
