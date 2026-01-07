export function buildDistictElasticDevice(tag: string) {
  return {
    size: 0,
    _source: ['log.file.path', 'DeviceName', 'DateTime'],
    query: {
      bool: {
        must: [
          {
            prefix: {
              'DeviceName.keyword': tag,
            },
          },
          {
            range: {
              DateTime: {
                gte: 'now/d',
                lte: 'now',
              },
            },
          },
        ],
      },
    },
    aggs: {
      distinct_paths: {
        terms: {
          field: 'log.file.path.keyword',
          size: 10000,
        },
      },
    },
  };
}
