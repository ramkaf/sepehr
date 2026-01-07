export const buildDailyIrradianceQuery = (
  irradiationDeviceNames: string[],
  irradiationParameter: string,
) => ({
  size: 0,
  _source: ['Irradiance_(temperature_compensated_signal)', 'DateTime'],
  query: {
    bool: {
      must: [
        {
          terms: {
            'DeviceName.keyword': irradiationDeviceNames,
          },
        },
        {
          range: {
            [irradiationParameter]: {
              gt: 0,
            },
          },
        },
        {
          range: {
            DateTime: {
              gte: 'now-6m',
              lte: 'now',
              time_zone: 'Asia/Tehran',
            },
          },
        },
      ],
    },
  },
  aggs: {
    latest_entry: {
      avg: {
        field: irradiationParameter,
      },
    },
  },
});
