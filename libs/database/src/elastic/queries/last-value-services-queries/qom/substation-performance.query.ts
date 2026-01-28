export const buildQomPowerPlantSubstationPerformanceQuery = (
  device: string,
) => ({
  size: 0,
  aggs: {
    latest_irradiance: {
      filter: {
        bool: {
          must: [
            {
              terms: {
                'DeviceName.keyword': [
                  'Irradiation 1',
                  'Irradiation 2',
                  'Irradiation 3',
                ],
              },
            },
            {
              range: {
                DateTime: {
                  gte: 'now-15m',
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
          top_hits: {
            size: 1,
            sort: [
              {
                DateTime: {
                  order: 'desc',
                },
              },
            ],
            _source: [
              'Irradiance_(temperature_compensated_signal)',
              'DateTime',
            ],
          },
        },
      },
    },
    latest_p_total: {
      filter: {
        bool: {
          must: [
            {
              terms: {
                'DeviceName.keyword': [device],
              },
            },
            {
              range: {
                DateTime: {
                  gte: 'now-15m',
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
          top_hits: {
            size: 1,
            sort: [
              {
                DateTime: {
                  order: 'desc',
                },
              },
            ],
            _source: ['P_total', 'DateTime'],
          },
        },
      },
    },
  },
});
