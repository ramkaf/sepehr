const { DateTime } = require('luxon');

export function findMidnightValues(mergedEnergy: any[], mergedMidnight: any[]) {
  return mergedEnergy.map((obj) => {
    const date = obj.date.split('T')[0];
    const midnight = mergedMidnight.find((item) => item.date.includes(date));
    return {
      ...obj,
      midnight,
    };
  });
}
export function daysPassedSinceJan1(dateInput: any): number {
  const date = new Date(dateInput);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}
export function daysInMonth(year: any, month: any) {
  // Create a Date object for the first day of the next month
  const date = new Date(year, month, 0);
  // Get the number of days in the month
  return date.getDate();
}
export function extractMonth(dateString: any) {
  const date = new Date(dateString);
  return date.getMonth() + 1; // Convert zero-based index to 1-based month number
}
export function extractYear(dateString: any) {
  const date = new Date(dateString);
  // Use getFullYear() to extract the year
  return date.getFullYear();
}
export function daysInYear(dateString: any) {
  // Parse the input date string into a Date object
  const date = new Date(dateString);

  // Extract the year from the Date object
  const year = date.getFullYear();

  // Check if the year is a leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  // Return 366 days for a leap year and 365 days for a common year
  return isLeapYear ? 366 : 365;
}
export function daysBetween(date1String: any, date2String: any): number {
  // Parse the date strings into Date objects
  const date1 = new Date(date1String);
  const date2 = new Date(date2String);

  // Check if dates are valid
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    throw new Error('Invalid date string provided');
  }

  // Calculate the difference in milliseconds
  const diffTime = Math.abs(date2.getTime() - date1.getTime());

  // Convert milliseconds to days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function mergeByDateMidnight(arr1: any[], arr2: any[]) {
  const merged: any[] = [];

  // Create a map from the second array to facilitate quick lookups
  const map2 = new Map(arr2?.map((item) => [item.date, item]));

  // Iterate over the first array and merge with corresponding items from the map
  arr1.forEach((item1) => {
    const item2 = map2?.get(item1.date);
    if (item2) {
      merged.push({
        date: item1.date,
        midnightEnergyHV1: item1.midnightEnergyHV1,
        midnightEnergyHV2: item2.midnightEnergyHV2,
        totalMidnightEnergy: item1.midnightEnergyHV1 + item2.midnightEnergyHV2,
      });
    } else {
      merged.push({
        date: item1.date,
        midnightEnergyHV1: item1.midnightEnergyHV1,
        midnightEnergyHV2: 0,
        totalMidnightEnergy: item1.midnightEnergyHV1,
      });
    }
  });

  return merged;
}
export function mergeByDate(arr1: any[], arr2: any[]) {
  const merged: any[] = [];

  // Create a map from the second array to facilitate quick lookups
  const map2 = new Map(arr2?.map((item) => [item.date, item]));

  // Iterate over the first array and merge with corresponding items from the map
  arr1.forEach((item1) => {
    const item2 = map2?.get(item1.date);
    if (item2) {
      merged.push({
        date: item1.date,
        EnergyHV1: item1.avgHV1,
        EnergyHV2: item2.avgHV2,
        totalEnergy:
          (item1.avgHV1 == null ? NaN : item1.avgHV1) +
          (item2.avgHV2 == null ? NaN : item2.avgHV2),
      });
    } else {
      merged.push({
        date: item1.date,
        EnergyHV1: item1.avgHV1,
        EnergyHV2: 0,
        totalEnergy: item1.avgHV1 == null ? NaN : item1.avgHV1,
      });
    }
  });
  return merged;
}
export function getFirstDayOfMonth(dateString: any) {
  // Parse the input date string into a DateTime object in Asia/Tehran timezone
  const date = DateTime.fromISO(dateString, { zone: 'Asia/Tehran' });

  // Create a DateTime object for the first day of the same month in Asia/Tehran timezone
  const firstDayOfMonth = date.startOf('month');

  // Format the DateTime object to the desired format with timezone offset
  const formattedDate = firstDayOfMonth.toISO({ includeOffset: true });

  return formattedDate;
}
export function getLastDayOfMonth(dateString: any) {
  // Parse the input date string into a DateTime object in Asia/Tehran timezone
  const date = DateTime.fromISO(dateString, { zone: 'Asia/Tehran' });

  // Get the last day of the month
  const lastDayOfMonth = date.endOf('month');

  // Set the time to 23:59:00
  const lastDayWithTime = lastDayOfMonth.set({
    hour: 23,
    minute: 59,
    second: 0,
    millisecond: 0,
  });

  // Format the DateTime object to the desired format with timezone offset
  const formattedDate = lastDayWithTime.toISO({ includeOffset: true });

  return formattedDate;
}
export function getFirstDayOfYear(dateString: any) {
  // Parse the input date string into a DateTime object in Asia/Tehran timezone
  const date = DateTime.fromISO(dateString, { zone: 'Asia/Tehran' });

  // Create a DateTime object for January 1st of the same year with time set to 00:00:00
  const firstDayOfYear = DateTime.fromObject({
    year: date.year,
    month: 1, // January
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  }).setZone('Asia/Tehran');

  // Format the DateTime object to the desired format with timezone offset
  return firstDayOfYear.toISO({ includeOffset: true });
}
export function getLastDayOfYear(dateString: any) {
  // Parse the input date string into a DateTime object in Asia/Tehran timezone
  const date = DateTime.fromISO(dateString, { zone: 'Asia/Tehran' });

  // Create a DateTime object for December 31st of the same year with time set to 23:59:00
  const lastDayOfYear = DateTime.fromObject({
    year: date.year,
    month: 12, // December
    day: 31,
    hour: 23,
    minute: 59,
    second: 0,
    millisecond: 0,
  }).setZone('Asia/Tehran');

  // Format the DateTime object to the desired format with timezone offset
  return lastDayOfYear.toISO({ includeOffset: true });
}
export function getStartOfDay(dateString: any) {
  // Parse the input date string into a DateTime object in Asia/Tehran timezone
  const date = DateTime.fromISO(dateString, { zone: 'Asia/Tehran' });

  // Get the start of the day (00:00:00) in the same timezone
  const startOfDay = date.startOf('day');

  // Format the DateTime object to the desired format with timezone offset
  return startOfDay.toISO({ includeOffset: true });
}
export function getEndOfDay(dateString: any) {
  // Parse the input date string into a DateTime object in Asia/Tehran timezone
  const date = DateTime.fromISO(dateString, { zone: 'Asia/Tehran' });

  // Get the end of the day (23:59:00) in the same timezone
  const endOfDay = date.set({
    hour: 23,
    minute: 59,
    second: 0,
    millisecond: 0,
  });

  // Format the DateTime object to the desired format with timezone offset
  return endOfDay.toISO({ includeOffset: true });
}
export function daysCount(date: string, mode: any) {
  const newDate = new Date(date);
  const currentDate = new Date(Date.now());

  const month = extractMonth(newDate);
  const year = extractYear(newDate);
  const currentMonth = extractMonth(currentDate);
  const currentYear = extractYear(currentDate);
  if (mode === 'month') {
    if (currentYear !== year) return daysInMonth(year, month);
    if (currentYear === year && currentMonth > month)
      return daysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(date);
    return daysBetween(firstDay, currentDate) + 1;
  } else {
    if (currentYear !== year) return daysInYear(date);
    return daysPassedSinceJan1(currentDate);
  }
}
