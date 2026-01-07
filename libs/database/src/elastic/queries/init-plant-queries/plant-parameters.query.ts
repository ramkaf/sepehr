export const getPlantParametersQuery = (entity_type_tag: string) => ({
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
            'DeviceName.keyword': `${entity_type_tag}`,
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
