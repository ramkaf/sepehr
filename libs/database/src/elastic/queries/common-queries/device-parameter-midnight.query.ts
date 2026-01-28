export const buildMidnightDeviceFieldQuery = (
  deviceName: string,
  fieldName: string,
) => ({
  size: 1,
  _source: [fieldName, 'DeviceName', 'DateTime'],
  sort: [
    {
      DateTime: {
        order: 'desc',
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
          range: {
            DateTime: {
              lt: 'now/d',
              time_zone: 'Asia/Tehran',
            },
          },
        },
      ],
    },
  },
});
