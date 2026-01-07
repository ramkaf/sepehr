import { MaskFunctionsEnum } from 'libs/enums';
import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildSubstationPerformanceAllValueQuery = (
  device: string,
  installedPower: number,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
  irradiationDevices: string[],
  irradiationParameter: string,
  maskFunction: MaskFunctionsEnum | null,
  powerParameter = 'P_total',
) => {
  const powerMaskCondition =
    maskFunction === MaskFunctionsEnum.ReLUReverse
      ? `doc['${powerParameter}'].value < 0`
      : `doc['${powerParameter}'].value > 0`;

  const powerMaskReturn = `
    if (${powerMaskCondition}) {
      return Math.abs(doc['${powerParameter}'].value);
    }
  `;

  const irradiationCondition = irradiationDevices
    .map((d) => `doc['DeviceName.keyword'].value.startsWith('${d}')`)
    .join(' || ');

  const devicePrefixCondition = `doc['DeviceName.keyword'].size() > 0 && doc['DeviceName.keyword'].value.startsWith('${device}')`;

  return {
    _source: [irradiationParameter, powerParameter, 'DateTime'],
    query: {
      bool: {
        must: [
          {
            bool: {
              should: [
                ...irradiationDevices.map((d) => ({
                  prefix: { 'DeviceName.keyword': d },
                })),
                { prefix: { 'DeviceName.keyword': device } },
              ],
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
                  if (${irradiationCondition}) {
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
                  if (${devicePrefixCondition}) {
                    if (doc['${powerParameter}'].size() > 0) {
                      ${powerMaskReturn}
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
                  return params.ptotal * 100 / (1.179 * ${installedPower} * params.irradiance / 1000);
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
