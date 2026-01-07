import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildWeatherAllValueQuery = (
  plantId: number,
  field: string,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
) => ({
  size: 0,
  query: {
    bool: {
      filter: [
        {
          range,
        },
        {
          term: {
            plant_id: plantId,
          },
        },
      ],
    },
  },
  aggs: {
    by_date: {
      date_histogram,
      aggs: {
        avg: {
          avg: {
            field,
          },
        },
        max: {
          max: {
            field,
          },
        },
        min: {
          min: {
            field,
          },
        },
        currentValue: {
          top_hits: {
            size: 1,
            _source: {
              includes: [field],
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
