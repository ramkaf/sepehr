import { promises as fs } from 'fs';
import { randomBytes, randomInt } from 'crypto';
import * as qrcode from 'qrcode';
import { InternalServerErrorException } from '@nestjs/common';
import { PlantSetupEnum } from 'libs/enums';
import { writeFile } from 'fs/promises';

export const readFileContents = async (filePath: string): Promise<string> => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    const e = error as Error;
    console.error('Error reading file:', error);
    throw error;
  }
};

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return JSON.stringify(err);
}
export function toTitleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
export function getIndexByPlantTag(tag: string) {
  return `${tag}-*`;
}

export function generateSecureRandomToken(): string {
  return randomBytes(16).toString('hex'); // 16 bytes = 32 hexadecimal characters
}
export function generateRandomSixDigit(): string {
  return randomInt(100000, 1000000).toString(); // Generates a number between 100000 and 999999
}
export const escapeIdentifier = (str: string) => `"${str.replace(/"/g, '""')}"`;

export const generateRandomCode = (
  type: 'string' | 'number' | 'number&string',
  length: number,
) => {
  const numberChars = '0123456789';
  const stringChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let characters = '';

  switch (type) {
    case 'number':
      characters = numberChars;
      break;
    case 'string':
      characters = stringChars;
      break;
    case 'number&string':
      characters = numberChars + stringChars;
      break;
    default:
      throw new Error(
        "Invalid type. Use 'number', 'string', or 'number&string'",
      );
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};
export function parseTimeToSeconds(timeStr: string): number {
  const regex = /^(\d+)(s|m|h|d|y)$/i;
  const match = timeStr.match(regex);

  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's':
      return value; // seconds
    case 'm':
      return value * 60; // minutes
    case 'h':
      return value * 3600; // hours
    case 'd':
      return value * 86400; // days
    case 'y':
      return value * 31536000; // years (365 days)
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}
export async function generateQrcode(url: string): Promise<string> {
  try {
    return await qrcode.toDataURL(url);
  } catch (error) {
    console.log(error);

    throw new InternalServerErrorException('error in generating qrcode');
  }
}
export function getNestedValue<T>(obj: any, path: string): T | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
export function generateWhereClause(input: string | number, idPropName = 'id') {
  if (typeof input === 'string') {
    return { uuid: input };
  } else if (typeof input === 'number') {
    return { [idPropName]: input };
  } else {
    throw new Error('Input must be a string or a number');
  }
}

export function maskIranianPhone(phone: string): string {
  const localPattern = /^09\d{9}$/;
  const internationalPattern = /^\+989\d{9}$/;

  if (localPattern.test(phone)) {
    return phone.slice(0, 4) + '******' + phone.slice(-2);
  }

  if (internationalPattern.test(phone)) {
    return phone.slice(0, 7) + '******' + phone.slice(-2);
  }

  throw new Error('Invalid Iranian phone number format');
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');

  if (!local || !domain) {
    throw new Error('Invalid email format');
  }

  if (local.length <= 2) {
    // اگر لوکال پارت خیلی کوتاه است، همه حروف را بدون تغییر نمایش بده
    return `${local}@${domain}`;
  }

  const firstChar = local[0];
  const lastChar = local[local.length - 1];
  const maskedMiddle = '*'.repeat(local.length - 2);

  return `${firstChar}${maskedMiddle}${lastChar}@${domain}`;
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function comparePlantSetupSteps(
  stepA: PlantSetupEnum,
  stepB: PlantSetupEnum,
): number {
  const steps = Object.values(PlantSetupEnum);

  const indexA = steps.indexOf(stepA);
  const indexB = steps.indexOf(stepB);

  if (indexA > indexB) return 1;

  if (indexA < indexB) return -1;

  return 0;
}
export function getFormattedDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateUniqueCombination(array: any, fields: string[]) {
  const seen = new Set();
  for (const item of array) {
    const combo = fields.map((field) => item[field]).join('::');
    if (seen.has(combo)) return { check: false, combo };
    seen.add(combo);
  }
  return { check: true, combo: null };
}

export function removeKeys(jsonObj: any, keys: string[]) {
  return Object.fromEntries(
    Object.entries(jsonObj).filter(([key]) => !keys.includes(key)),
  );
}

export function calculateDurationBetween2Date(
  startDate: string,
  endDate: string | null = null,
) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date');
  }
  if (endDate && isNaN(end.getTime())) {
    throw new Error('Invalid end date');
  }

  const diff = end.getTime() - start.getTime();
  const durationInSeconds = Math.floor(diff / 1000);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let durationString = '';
  if (days > 0) {
    durationString += `${String(days).padStart(2, '0')}:`;
  }
  durationString += `${String(hours).padStart(2, '0')}:`;
  durationString += `${String(minutes).padStart(2, '0')}:`;
  durationString += `${String(seconds).padStart(2, '0')}`;

  return {
    duration: durationInSeconds,
    strDuration: durationString,
  };
}

export function generatePlantIndex(plantTag: string) {
  return `${plantTag}-*`;
}

export function detectValueType(value: any) {
  // Case 1: Actual number
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return 'number';
  }

  // Case 2: String
  if (typeof value === 'string' && value.trim() !== '') {
    // Binary string check
    if (/^[01]+$/.test(value)) {
      return 'binarystring';
    }

    // Decimal number check
    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) {
      return 'number';
    }

    return 'string';
  }

  // Fallback
  return 'string';
}
export function getFormattedDateTime(): string {
  const now = new Date();

  // Get timezone offset in minutes and convert to ±HH:MM format
  const offsetMinutes = now.getTimezoneOffset();
  const sign = offsetMinutes > 0 ? '-' : '+';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMins = String(absOffset % 60).padStart(2, '0');

  // Build offset string (e.g., "+03:30")
  const offset = `${sign}${offsetHours}:${offsetMins}`;

  // Format milliseconds as 7 digits (simulate .NET-style microseconds)
  const ms = String(now.getMilliseconds()).padStart(3, '0') + '0159';

  // Build final ISO string manually (no 'Z' at the end)
  const dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(now.getDate()).padStart(2, '0')}T${String(
    now.getHours(),
  ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
    now.getSeconds(),
  ).padStart(2, '0')}.${ms}${offset}`;

  return dateTime;
}

export function extractInverterAndIrradiation(str: string) {
  const parts: string[] = str.split(':');
  const inverterPart = parts.find((p: string) =>
    p.trim().startsWith('Inverter'),
  );
  if (!inverterPart) {
    throw new Error('Inverter part not found in string');
  }
  const match = inverterPart.match(/Inverter\s+(\d+)/i);
  if (!match) {
    throw new Error('Inverter number not found');
  }
  const inverterNumber = match[1];

  // Compose output
  const inverterName = `Inverter ${inverterNumber}`;
  const irradiationName = `Irradiation ${inverterNumber}`;

  return { inverterName, irradiationName };
}

export function addCumulativeToBuckets(buckets: any) {
  let runningCount = 0;
  let runningSum = 0;

  return buckets.map((bucket) => {
    const count = bucket.doc_count.value ?? 0;
    const sum = bucket.total_sum.value ?? 0;

    runningCount += count;
    runningSum += sum;

    const cumulativeAvg = runningCount > 0 ? runningSum / runningCount : 0;

    return {
      ...bucket,
      cumulative_doc_count: runningCount,
      cumulative_total_sum: runningSum,
      cumulative_avg: cumulativeAvg,
    };
  });
}
export function logStringify(str: any) {
  console.log(JSON.stringify(str, null, 4));
}
export async function saveJson(data: any): Promise<void> {
  await writeFile('a.json', JSON.stringify(data, null, 2), 'utf8');
}
