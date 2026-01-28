export const buildLatestDeviceObjElasticQuery = (deviceName: string) => ({
  query: {
    bool: {
      must: [
        {
          prefix: { 'DeviceName.keyword': deviceName },
        },
      ],
    },
  },
  sort: [{ DateTime: { order: 'desc' } }],
  size: 1,
});
