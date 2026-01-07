export const buildMehrizPowerPlantModQuery = () => ({
  size: 0,
  query: {
    bool: {
      should: [
        { term: { 'DeviceName.keyword': 'Moxa1242 SUB 3' } },
        { term: { 'DeviceName.keyword': 'Moxa1242 SUB 4' } },
      ],
      minimum_should_match: 1,
    },
  },
  aggs: {
    devices: {
      terms: {
        field: 'DeviceName.keyword',
        size: 10,
      },
      aggs: {
        last_values: {
          top_hits: {
            _source: ['AI0Scaling', 'DateTime'],
            sort: [
              {
                DateTime: {
                  order: 'desc',
                },
              },
            ],
            size: 1,
          },
        },
      },
    },
  },
});
