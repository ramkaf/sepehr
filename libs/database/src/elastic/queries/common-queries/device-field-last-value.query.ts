export const buildLatestDeviceFieldElasticQuery = (
  deviceName: string,
  fieldName: string | string[],
) => {
  const fields: string[] = Array.isArray(fieldName) ? fieldName : [fieldName];

  return {
    _source: [...fields, 'DateTime', 'DeviceName'],
    query: {
      bool: {
        must: [
          {
            prefix: { 'DeviceName.keyword': deviceName },
          },
          {
            range: {
              DateTime: {
                gte: 'now-5m',
                lte: 'now',
                time_zone: 'Asia/Tehran',
              },
            },
          },
        ],
      },
    },
    sort: [{ DateTime: { order: 'desc' } }],
    size: 1,
  };
};
