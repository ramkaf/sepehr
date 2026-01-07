import {
  IRangeQuery,
  IDateHistogram,
  TimeRangeResult,
  IDateDetails,
  PeriodEnum,
} from 'libs/interfaces';
import { format, subMinutes, addHours, addMinutes } from 'date-fns';
import moment = require('moment-timezone');
import { RangeTypeEnum } from 'libs/enums';
import { func } from 'joi';
export function setTimeRange(dateDetails: IDateDetails): TimeRangeResult {
  let range: IRangeQuery = {
    DateTime: {
      gte: 'now/d',
      lte: 'now',
      time_zone: 'Asia/Tehran',
    },
  };

  let date_histogram: IDateHistogram = {
    field: 'DateTime',
    fixed_interval: '15m',
    time_zone: 'Asia/Tehran',
  };

  let date_histogram_midnight: IDateHistogram = {
    field: 'DateTime',
    fixed_interval: '1d',
    time_zone: 'Asia/Tehran',
  };

  if (dateDetails.mode !== PeriodEnum.Default) {
    range = {
      DateTime: {
        gte: dateDetails.startDate ?? 'now/d',
        lte: dateDetails.endDate ?? 'now',
        time_zone: 'Asia/Tehran',
      },
    };

    switch (dateDetails.mode) {
      case PeriodEnum.C:
        date_histogram = {
          field: 'DateTime',
          fixed_interval: '15m',
          time_zone: 'Asia/Tehran',
        };
        date_histogram_midnight = {
          field: 'DateTime',
          fixed_interval: '1d',
          time_zone: 'Asia/Tehran',
        };
        break;

      case PeriodEnum.D:
        date_histogram = {
          field: 'DateTime',
          fixed_interval: '1d',
          time_zone: 'Asia/Tehran',
        };
        date_histogram_midnight = {
          field: 'DateTime',
          fixed_interval: '1d',
          time_zone: 'Asia/Tehran',
        };
        break;

      case PeriodEnum.M:
        date_histogram = {
          field: 'DateTime',
          calendar_interval: 'month',
          time_zone: 'Asia/Tehran',
        };
        date_histogram_midnight = {
          field: 'DateTime',
          calendar_interval: 'month',
          time_zone: 'Asia/Tehran',
        };
        break;

      case PeriodEnum.Y:
        date_histogram = {
          field: 'DateTime',
          calendar_interval: 'year',
          time_zone: 'Asia/Tehran',
        };
        date_histogram_midnight = {
          field: 'DateTime',
          calendar_interval: 'year',
          time_zone: 'Asia/Tehran',
        };
        break;

      default:
        // fallback to custom defaults
        date_histogram = {
          field: 'DateTime',
          fixed_interval: '15m',
          time_zone: 'Asia/Tehran',
        };
        date_histogram_midnight = {
          field: 'DateTime',
          fixed_interval: '1d',
          time_zone: 'Asia/Tehran',
        };
        break;
    }
  }

  return { range, date_histogram, date_histogram_midnight };
}

// export function subtractTimeFromDate(
//   value: number,
//   unit: string,
//   data_delay: number
// ) {
//   const { nowMinusMinutesFormatted, nowFormatted } =
//     getLastDateMinutesTimes(data_delay);

//   const dateObj = new Date(nowMinusMinutesFormatted);

//   switch (unit) {
//     case 'm':
//       dateObj.setMinutes(dateObj.getMinutes() - value);
//       break;
//     case 'h':
//       dateObj.setHours(dateObj.getHours() - value);
//       break;
//     case 'd':
//       dateObj.setDate(dateObj.getDate() - value);
//       break;
//     default:
//       throw new Error('Invalid time unit. Use m, h, or d');
//   }

//   return { gte: dateObj.toISOString(), lte: nowFormatted };
// }

// export function getLastDateMinutesTimes(minute: number) {
//   const now = new Date();

//   // Format the current time with milliseconds
//   const nowFormatted = formatDateWithMilliseconds(now);

//   // Subtract the minutes
//   const nowMinusMinutes = subMinutes(now, minute);

//   // Format the time for X minutes ago with milliseconds
//   const nowMinusMinutesFormatted = formatDateWithMilliseconds(nowMinusMinutes);

//   return {
//     nowMinusMinutesFormatted,
//     nowFormatted,
//   };
// }
export function getLastDateMinutesTimes(minute: number) {
  minute = minute / 60;
  const now = moment().tz('Asia/Tehran');

  // Format the current time with milliseconds
  const nowFormatted = now.format('YYYY-MM-DDTHH:mm:ss.SSS');
  const nowMinus2m = now.subtract(minute, 'minutes');

  // Format the time for 2 minutes ago with milliseconds
  const nowMinus2mFormatted = nowMinus2m.format('YYYY-MM-DDTHH:mm:ss.SSS');

  return { nowMinus2mFormatted, nowFormatted };
}
export function subtractTimeFromDate(
  value: number,
  unit: RangeTypeEnum,
  data_delay: number,
) {
  const { nowMinus2mFormatted, nowFormatted } =
    getLastDateMinutesTimes(data_delay);

  const dateObj = new Date(nowMinus2mFormatted);

  switch (unit) {
    case 'm':
      dateObj.setMinutes(dateObj.getMinutes() - value);
      break;
    case 'h':
      dateObj.setHours(dateObj.getHours() - value);
      break;
    case 'd':
      dateObj.setDate(dateObj.getDate() - value);
      break;
    default:
      throw new Error('Invalid time unit. Use m, h, or d');
  }

  return { gte: dateObj.toISOString(), lte: nowFormatted };
}
function formatDateWithMilliseconds(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
}

// For Tehran timezone (UTC+3:30)
export function getLastDateMinutesTimesTehran(minute: number) {
  const now = new Date();

  // Convert to Tehran time (UTC+3:30)
  const nowTehran = addMinutes(addHours(now, 3), 30);
  const nowMinusMinutesTehran = subMinutes(nowTehran, minute);

  return {
    nowMinusMinutesFormatted: formatDateWithMilliseconds(nowMinusMinutesTehran),
    nowFormatted: formatDateWithMilliseconds(nowTehran),
  };
}

export function getHourlyDifference(time1: string, time2: string): number {
  const start = moment.tz(time1, 'Asia/Tehran');
  const end = moment.tz(time2, 'Asia/Tehran');
  const diffHours = end.diff(start, 'hours', true);
  return diffHours;
}

export function msToTime(duration: number): string {
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const hoursMs = hours * 1000 * 60 * 60;
  const minutes = Math.floor((duration - hoursMs) / (1000 * 60));
  const minutesMs = minutes * 1000 * 60;
  const seconds = Math.floor((duration - hoursMs - minutesMs) / 1000);
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function toIranOffset(dateString: string): string {
  const date = new Date(dateString);
  const offsetMinutes = 3 * 60 + 30; // +03:30
  const local = new Date(date.getTime() + offsetMinutes * 60000);

  const pad = (n: any) => String(n).padStart(2, '0');

  const year = local.getUTCFullYear();
  const month = pad(local.getUTCMonth() + 1);
  const day = pad(local.getUTCDate());
  const hours = pad(local.getUTCHours());
  const minutes = pad(local.getUTCMinutes());
  const seconds = pad(local.getUTCSeconds());
  const ms = String(local.getUTCMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}+03:30`;
}

export function calculateDifferentBetween2DateInHours(
  start: string,
  end: string,
) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
  const diffHours = diffMs / (1000 * 60 * 60);
  return { start, end, diffHours };
}
