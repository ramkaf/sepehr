export const buildSubstationIrradiationLastValueQuery = (
  deviceName = 'Irradiation',
  logPrefix = '*WS-01*',
) => ({
  _source: {
    excludes: [
      'DeviceID',
      'agent',
      'input',
      'host',
      'tags',
      'log',
      '@version',
      '@timestamp',
      'event',
      'ecs',
      'is_sent',
      'message',
      'fields',
    ],
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
            'log.file.path.keyword': logPrefix,
          },
        },
        {
          range: {
            DateTime: {
              gte: 'now-10m',
              lte: 'now',
              time_zone: 'Asia/Tehran',
            },
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
