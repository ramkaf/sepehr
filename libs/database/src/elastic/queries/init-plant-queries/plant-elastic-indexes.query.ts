export const getPlantElasticIndexesQuery = () => ({
  size: 0,
  query: {
    bool: {
      filter: [
        {
          range: {
            DateTime: {
              gte: 'now-1h',
              lte: 'now',
            },
          },
        },
      ],
    },
  },
  aggs: {
    unique_plants: {
      terms: {
        field: '_index',
        size: 1000,
        include: '.*-.*',
      },
    },
  },
});
