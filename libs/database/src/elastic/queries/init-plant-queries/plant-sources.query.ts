export const buildPlantSourcesQuery = () => ({
  size: 0,
  query: {
    range: {
      DateTime: {
        gte: 'now-15m',
        lte: 'now',
      },
    },
  },
  aggs: {
    server_names: {
      terms: {
        script: {
          source: `
                  def path = doc['log.file.path.keyword'].value;
                  def uncPattern = /^\\\\\\\\([^\\\\]+)/;
                  def uncMatcher = uncPattern.matcher(path);
                  if (uncMatcher.find()) {
                    return uncMatcher.group(1);
                  }
                  def localPattern = /^[A-Za-z]:\\\\ModbusClientData/;
                  def localMatcher = localPattern.matcher(path);
                  if (localMatcher.find()) {
                    return 'ModbusClientData';
                  }

                  return 'unknown';
                `,
          lang: 'painless',
        },
        size: 10,
      },
    },
  },
});
