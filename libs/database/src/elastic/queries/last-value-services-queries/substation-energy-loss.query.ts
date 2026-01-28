export const buildLossSubstationEnergyQuery = (
  energyParameter: string,
  deviceName: string,
  logFilePrefix: string,
) => ({
  _source: {
    includes: [energyParameter, 'E-Daily'],
  },
  query: {
    bool: {
      must: [
        {
          match: {
            'DeviceName.keyword': deviceName,
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
