import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildAvailabilityAllValuesQuery = (
  entity_tag: string,
  range: IRangeQuery,
  date_histogram: IDateHistogram,
) => ({
  size: 0,
  query: {
    bool: {
      must: [
        {
          match: {
            'source_str.keyword': entity_tag,
          },
        },
        {
          range,
        },
      ],
    },
  },
  aggs: {
    date_histogram: {
      date_histogram,
      aggs: {
        avg: {
          avg: {
            field: 'availability',
          },
        },
        max: {
          avg: {
            field: 'availability',
          },
        },
        min: {
          avg: {
            field: 'availability',
          },
        },
        current: {
          top_hits: {
            size: 1,
            _source: {
              includes: ['availability'],
            },
            sort: [
              {
                DateTime: {
                  order: 'desc',
                },
              },
            ],
          },
        },
      },
    },
  },
});
