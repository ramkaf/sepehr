export const availabilityLastValueQuery = (entity_tag: string) => ({
  size: 1,
  _source: ['availability', 'source_str', 'DateTime'],
  query: {
    match: {
      'source_str.keyword': entity_tag,
    },
  },
  sort: [
    {
      DateTime: {
        order: 'desc',
        unmapped_type: 'date',
      },
    },
  ],
});
