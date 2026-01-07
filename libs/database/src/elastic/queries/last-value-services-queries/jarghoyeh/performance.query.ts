export const buildJarghoyehPowerPlantPerformanceQuery = (
  irradianceDevice: string,
  irradianceParameter: string,
  hvDevices: string[],
  powerParameter: string,
) => ({
  size: 0,
  aggs: {
    by_device: {
      terms: {
        field: 'DeviceName.keyword',
        include: hvDevices,
        size: 10,
      },
      aggs: {
        latest_P_total: {
          filter: {
            range: {
              DateTime: {
                gte: 'now-15m',
                lte: 'now',
                time_zone: 'Asia/Tehran',
              },
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
                _source: [powerParameter],
              },
            },
          },
        },
      },
    },
    latest_irradiance: {
      filter: {
        bool: {
          must: [
            {
              terms: {
                'DeviceName.keyword': [irradianceDevice],
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
            _source: [irradianceParameter, 'DateTime'],
          },
        },
      },
    },
  },
});
