export const buildLosslessSubstationEnergyQuery = (
  deviceName: string,
  logFilePrefix: string,
  energyParameter = 'E-Daily',
) => ({
  _source: {
    includes: [energyParameter, 'DateTime'],
  },
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
          wildcard: {
            'log.file.path.keyword': logFilePrefix,
          },
        },
      ],
    },
  },
  sort: [
    {
      DateTime: {
        order: 'desc',
      },
    },
  ],
  size: 1,
});
