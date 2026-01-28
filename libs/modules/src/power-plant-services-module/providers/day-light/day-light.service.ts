import { BadRequestException, Injectable } from '@nestjs/common';
import { ElasticService } from 'libs/database';
import { IDateDetails, PeriodEnum } from 'libs/interfaces';
import { DateTime } from 'luxon';
import {
  DEFAULT_DAYLIGHT_MAPPING,
  PLANT_DAYLIGHT_MAPPINGS,
} from '../constants/day-light-parameter.constants';
import {
  calculateDifferentBetween2DateInHours,
  generatePlantIndex,
  toIranOffset,
} from 'libs/utils';
import { IDaylightMappingProfile } from '../interfaces/day-light-mapping.interface';

@Injectable()
export class PlantDayLightService {
  constructor(private readonly elasticService: ElasticService) {}
  async computeDailyDaylightIntervals(
    plantTag: string,
    dateDetails: IDateDetails,
  ) {
    try {
      const { startDate, endDate } = this.normalizeDateDetails(dateDetails);
      const profile = this.resolveProfile(plantTag);
      const plantIndex = generatePlantIndex(plantTag);
      const filters: any =
        dateDetails.mode === PeriodEnum.Default
          ? [
              {
                range: {
                  DateTime: {
                    gte: 'now/d',
                    lte: 'now',
                    time_zone: 'Asia/Tehran',
                  },
                },
              },
            ]
          : [
              {
                range: {
                  DateTime: {
                    gte: startDate.toISO(),
                    lte: endDate.toISO(),
                    time_zone: 'Asia/Tehran',
                  },
                },
              },
            ];

      if (profile?.deviceNames?.length > 0) {
        filters.push({
          terms: {
            'DeviceName.keyword': profile.deviceNames,
          },
        });
      }

      if (profile?.field && profile?.operator && profile?.threshold != null) {
        filters.push({
          range: {
            [profile.field]: {
              [profile.operator]: profile.threshold,
            },
          },
        });
      }

      const query = {
        size: 0,
        query: {
          bool: {
            filter: filters,
          },
        },
        aggs: {
          daylight_per_day: {
            date_histogram: {
              field: 'DateTime',
              calendar_interval: 'day',
              time_zone: 'Asia/Tehran',
            },
            aggs: {
              daylight_start: {
                min: {
                  field: 'DateTime',
                },
              },
              daylight_end: {
                max: {
                  field: 'DateTime',
                },
              },
            },
          },
        },
      };

      const result = await this.elasticService.search(plantIndex, query);
      const buckets = result.aggregations?.daylight_per_day?.buckets || [];

      return buckets
        .map((bucket: any) => {
          const start = bucket?.daylight_start?.value_as_string;
          const end = bucket?.daylight_end?.value_as_string;
          if (!start || !end) {
            return null;
          }
          const { diffHours: diff } = calculateDifferentBetween2DateInHours(
            start,
            end,
          );
          return {
            date: bucket.key_as_string,
            start,
            end,
            diff,
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error(
        `Failed to compute daily daylight intervals for ${plantTag}` + error,
      );
      return [];
    }
  }
  buildDaylightShouldClauses(daylightIntervals: any) {
    try {
      const rangeClauses = daylightIntervals.map((interval) => ({
        range: {
          DateTime: {
            gte: interval.start,
            lte: interval.end,
            time_zone: 'Asia/Tehran',
          },
        },
      }));

      if (rangeClauses.length <= 1024) {
        return rangeClauses;
      }

      const chunkSize = 512;
      const chunked: any[] = [];
      for (let i = 0; i < rangeClauses.length; i += chunkSize) {
        const chunk = rangeClauses.slice(i, i + chunkSize);
        chunked.push({
          bool: {
            should: chunk,
            minimum_should_match: 1,
          },
        });
      }
      return chunked;
    } catch (error) {
      console.log('Failed to build daylight should clauses', error);
      return [];
    }
  }
  calculateDurations(ranges: any) {
    const results: any[] = [];

    try {
      ranges.forEach(({ range }) => {
        const start = DateTime.fromISO(range.DateTime.gte, {
          zone: 'Asia/Tehran',
        });
        const end = DateTime.fromISO(range.DateTime.lte, {
          zone: 'Asia/Tehran',
        });
        let cursor = start;

        while (cursor < end) {
          const dayEnd = DateTime.min(end, cursor.endOf('day'));
          const hours = dayEnd.diff(cursor, 'hours').hours;

          const dayKey = cursor.startOf('day').toISO({ includeOffset: true });
          const monthKey = cursor
            .startOf('month')
            .toISO({ includeOffset: true });
          const yearKey = cursor.startOf('year').toISO({ includeOffset: true });

          // Find or create entries for each mode/date combination
          const findOrCreateEntry = (mode, date) => {
            const existing: any = results.find(
              (item) => item.mode === mode && item.date === date,
            );
            if (existing) {
              existing.duration += hours;
            } else {
              results.push({ mode, date, duration: hours });
            }
          };

          findOrCreateEntry(PeriodEnum.D, dayKey);
          findOrCreateEntry(PeriodEnum.M, monthKey);
          findOrCreateEntry(PeriodEnum.Y, yearKey);

          cursor = dayEnd.plus({ milliseconds: 1 });
        }
      });

      return results;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  async generateShouldClause(plantTag: string, dateDetails_: IDateDetails) {
    const dateDetails =
      dateDetails_.mode === 'default'
        ? dateDetails_
        : {
            mode: dateDetails_.mode,
            startDate: toIranOffset(dateDetails_.startDate!),
            endDate: toIranOffset(dateDetails_.endDate!),
          };
    const intervals = await this.computeDailyDaylightIntervals(
      plantTag,
      dateDetails,
    );
    return this.buildDaylightShouldClauses(intervals);
  }
  private normalizeDateDetails(dateDetails: IDateDetails) {
    const mode = dateDetails.mode || PeriodEnum.C;
    const startDate = this.toAsiaTehran(
      dateDetails.startDate || DateTime.now().minus({ days: 1 }),
    );
    const endDate = this.toAsiaTehran(dateDetails.endDate || DateTime.now());
    if (endDate < startDate) {
      return {
        mode,
        startDate: endDate,
        endDate: startDate,
      };
    }
    return {
      mode,
      startDate,
      endDate,
    };
  }
  private toAsiaTehran(date: string | DateTime) {
    const dt =
      date instanceof DateTime
        ? date
        : DateTime.fromISO(date, { zone: 'Asia/Tehran' }) ||
          DateTime.fromJSDate(new Date(date), { zone: 'Asia/Tehran' });
    if (!dt || !dt.isValid) {
      return DateTime.now().setZone('Asia/Tehran');
    }
    return dt.setZone('Asia/Tehran');
  }
  private resolveProfile(plantTag: string): IDaylightMappingProfile {
    return (
      PLANT_DAYLIGHT_MAPPINGS.find((item) => item.plantTag === plantTag) ||
      DEFAULT_DAYLIGHT_MAPPING
    );
  }
}
