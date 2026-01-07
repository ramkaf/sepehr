export const buildSubCo2ReductionStringPowerPlantQuery = (
  co2ReductionParameter: string,
  subEntityTypeTag: string,
  subSource: string,
) => ({
  _source: [co2ReductionParameter, 'DateTime'],
  size: 1, // We need only the latest document
  sort: [
    {
      DateTime: {
        order: 'desc', // Sort by DateTime in descending order to get the latest document
      },
    },
  ],
  query: {
    bool: {
      filter: [
        {
          range: {
            DateTime: {
              gte: 'now-1h',
              lte: 'now',
              time_zone: 'Asia/Tehran',
            },
          },
        },
        {
          match_phrase: {
            DeviceName: subEntityTypeTag,
          },
        },
        {
          match_phrase: {
            'log.file.path': subSource,
          },
        },
      ],
    },
  },
});
