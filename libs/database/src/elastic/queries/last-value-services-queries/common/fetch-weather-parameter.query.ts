export const buildWeatherLastValueQuery = (plant_id: number) => ({
  size: 1,
  query: {
    bool: {
      filter: [
        {
          term: {
            plant_id,
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
});
