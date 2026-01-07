export const buildTypeNonComputationalParameterQuery = (
  entityTypeTag: string,
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
          prefix: {
            'DeviceName.keyword': entityTypeTag,
          },
        },
        {
          range: {
            DateTime: {
              gte: 'now-1h',
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
