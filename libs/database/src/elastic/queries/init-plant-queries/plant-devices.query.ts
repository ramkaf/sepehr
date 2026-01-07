export const fetchPlantDevicesQuery = () => ({
  _source: ['log.file.path', 'DeviceName'],
  size: 0,
  aggs: {
    by_sub: {
      terms: {
        script: {
          source: `
            def path = doc['log.file.path.keyword'].value;
            def matcher = /\\\\([^\\\\]+)\\\\/.matcher(path);
            return matcher.find() ? matcher.group(1) : null;
          `,
          lang: 'painless',
        },
      },
      aggs: {
        unique_device_names: {
          terms: {
            field: 'DeviceName.keyword',
            order: { _key: 'asc' },
            size: 10000,
          },
        },
      },
    },
  },
});
