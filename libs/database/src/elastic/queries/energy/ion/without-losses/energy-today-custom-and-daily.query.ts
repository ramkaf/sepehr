import { IDateHistogram, IRangeQuery } from 'libs/interfaces';

export const buildIonEnergyTodayWithoutLossesCustomAndDailyQuery = (
  deviceName: string,
  logFilePrefix: string,
  date_histogram: IDateHistogram,
  range: IRangeQuery,
) => ({
  _source: {
    includes: ['DateTime', 'AC_energy_fed_in_that_day'],
  },
  query: {
    bool: {
      must: [
        {
          match: {
            DeviceName: deviceName,
          },
        },
        {
          wildcard: {
            'log.file.path.keyword': `*${logFilePrefix}*`,
          },
        },
        {
          range: range,
        },
      ],
    },
  },
  size: 1,
  aggs: {
    daily_data: {
      date_histogram: date_histogram,
      aggs: {
        avg_power: {
          avg: {
            field: 'AC_energy_fed_in_that_day',
          },
        },
      },
    },
  },
});
