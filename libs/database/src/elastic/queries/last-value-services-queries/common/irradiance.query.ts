export const buildIrradianceLastValueQuery = (
  irradiationDeviceNames: string[],
  irradiationParameter: string,
) => ({
  size: 0, // No need to retrieve individual hits
  query: {
    bool: {
      must: [
        {
          terms: {
            'DeviceName.keyword': irradiationDeviceNames,
          },
        },
      ],
    },
  },
  aggs: {
    last_irradiance_per_device: {
      terms: {
        field: 'DeviceName.keyword',
        size: 10, // Adjust based on the number of expected devices
      },
      aggs: {
        last_record: {
          top_hits: {
            size: 1,
            sort: [
              {
                DateTime: {
                  order: 'desc', // Get the latest entry
                },
              },
            ],
            _source: [irradiationParameter, 'DeviceName', 'DateTime'],
          },
        },
      },
    },
  },
});
