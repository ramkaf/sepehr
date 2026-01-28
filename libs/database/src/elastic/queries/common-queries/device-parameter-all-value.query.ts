import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildDeviceParameterAllValueQuery = (
  deviceName: string,
  parameter: string,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
) => ({
  size: 0,
  _source: [parameter, 'DeviceName', 'DateTime'],
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
          prefix: {
            'DeviceName.keyword': {
              value: deviceName,
            },
          },
        },
        {
          range,
        },
      ],
    },
  },
  aggs: {
    parameter_over_time: {
      date_histogram,
      aggs: {
        param: {
          avg: {
            field: parameter,
          },
        },
      },
    },
  },
});
