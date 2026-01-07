export const buildJarghoyeh2TreeLastValueQuery = () => ({
  size: 0,
  query: {
    match_phrase: {
      DeviceName: 'Inverter',
    },
  },
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
        by_device: {
          terms: {
            field: 'DeviceName.keyword',
            size: 23,
          },
          aggs: {
            latest_record: {
              top_hits: {
                sort: [
                  {
                    DateTime: {
                      order: 'desc',
                    },
                  },
                ],
                _source: {
                  includes: [
                    'DeviceName',
                    'DateTime',
                    'Efficiency',
                    'Insulation_resistance',
                    'Internal_temperature',
                  ],
                },
                size: 1,
              },
            },
          },
        },
      },
    },
  },
});
