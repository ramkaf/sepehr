import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildPowerAllValueQuery = (
  outputEntityTag: string,
  power_parameter: string,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
  isPositiveInDay = false,
) => {
  // Determine the comparison operator
  const operator = isPositiveInDay ? '>' : '<';

  return {
    size: 0,
    _source: [power_parameter, 'DateTime'],
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
              'DeviceName.keyword': [outputEntityTag],
            },
          },
          {
            range,
          },
        ],
      },
    },
    aggs: {
      power_over_time: {
        date_histogram,
        aggs: {
          aggs: {
            avg: {
              script: {
                source: `
                  if (doc['DeviceName.keyword'].value == '${outputEntityTag}') { 
                    if (doc['${power_parameter}'].size() > 0 && doc['${power_parameter}'].value ${operator} 0) { 
                      return doc['${power_parameter}'].value; 
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
