import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { detectValueType } from 'libs/utils';

@Injectable()
export class MaskFunctionCoreService {
  // === Utility Functions ===
  MultiplyByThousand(value: any): number {
    if (detectValueType(value) === 'string') return value;

    return parseFloat(value) * 1000;
  }
  MultiplyByMillion(value: any): number {
    if (detectValueType(value) === 'string') return value;
    return parseFloat(value) * 1000000;
  }

  Absolute(value: number): number {
    if (detectValueType(value) === 'string') return value;
    return Math.abs(value);
  }

  AbsoluteAndDevide(value: number): number {
    if (typeof value !== 'number')
      throw new BadRequestException('Value must be a number');
    return Math.abs(value) / 1000;
  }

  ReLU(value: number): number {
    if (detectValueType(value) === 'string') return value;
    return value < 0 ? 0 : value;
  }

  ReLUReverse(value: number): number {
    if (detectValueType(value) === 'string') return value;
    return value > 0 ? 0 : Math.abs(value);
  }

  ReLUReverseAndDevide(value: number): number {
    if (detectValueType(value) === 'string') return value;
    return value > 0 ? 0 : Math.abs(value) / 1000;
  }

  BinaryToIp(binaryString: string): string {
    if (detectValueType(binaryString) !== 'binarystring') return binaryString;
    if (binaryString.length !== 32) {
      throw new BadRequestException('Binary string must be exactly 32 bits');
    }
    const octets = [
      binaryString.slice(0, 8),
      binaryString.slice(8, 16),
      binaryString.slice(16, 24),
      binaryString.slice(24, 32),
    ];
    return octets.map((octet) => parseInt(octet, 2)).join('.');
  }

  BinaryToMac(binaryString: string): string {
    if (detectValueType(binaryString) !== 'binarystring') return binaryString;
    if (binaryString.length !== 48) {
      throw new BadRequestException('Binary string must be exactly 48 bits');
    }
    const octets = [
      binaryString.slice(0, 8),
      binaryString.slice(8, 16),
      binaryString.slice(16, 24),
      binaryString.slice(24, 32),
      binaryString.slice(32, 40),
      binaryString.slice(40, 48),
    ];
    return octets
      .map((octet) => parseInt(octet, 2).toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
  }

  BinaryToString(binaryString: string): string {
    if (detectValueType(binaryString) !== 'binarystring') return binaryString;
    if (binaryString.length % 8 !== 0) {
      throw new BadRequestException(
        'Binary string length must be a multiple of 8',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const bytes = binaryString.match(/.{8}/g)!;
    return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join('');
  }

  BinaryToUnsignedLittleEndian(binaryString: string): number {
    if (detectValueType(binaryString) !== 'binarystring') return NaN;
    if (binaryString.length !== 32) {
      throw new BadRequestException('Binary string must be exactly 32 bits');
    }
    const bytes = binaryString.match(/.{8}/g);
    if (!bytes)
      throw new BadRequestException('Binary string must be exactly 32 bits');
    const littleEndianBinary = bytes.reverse().join('');
    return parseInt(littleEndianBinary, 2);
  }

  BinaryToDate(binaryString: string): string {
    if (detectValueType(binaryString) !== 'binarystring') return binaryString;
    if (binaryString.length !== 32) {
      throw new BadRequestException('Binary string must be exactly 32 bits');
    }
    const timestamp = parseInt(binaryString, 2);
    return new Date(timestamp * 1000).toISOString();
  }

  BinaryUptimeToTimeFormat(binaryString: string): string {
    if (detectValueType(binaryString) !== 'binarystring') return binaryString;
    if (binaryString.length !== 32) {
      throw new BadRequestException('Binary string must be exactly 32 bits');
    }
    const seconds = parseInt(binaryString, 2);
    const totalHours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${totalHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  scaleMOD(value: any): number {
    if (detectValueType(value) !== 'number') return value;
    const [fromMin, fromMax] = [4, 20];
    const [toMin, toMax] = [-50, 100];
    return toMin + ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin);
  }

  kelvinToCelsius(value: any): number {
    if (detectValueType(value) !== 'number') return value;
    return value - 273.15;
  }

  numberStringToNFixedNumber(value: any, fixedPoint = 2) {
    if (
      detectValueType(value) === 'string' ||
      detectValueType(value) === 'binarystring'
    )
      return value;
    return parseFloat(value.toFixed(fixedPoint));
  }

  formatReadableNumber(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    return Number(value).toLocaleString();
  }

  parseFloatMask(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    return parseFloat(value);
  }

  decimalToPercentage(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    return value * 100;
  }
  divideTo100(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    return Number(value / 100);
  }
  divideByThousand(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    return Number(value / 1000);
  }
  scaleMehrizMod(value: any) {
    if (detectValueType(value) !== 'number') return value;
    const [fromMin, fromMax] = [4, 20];
    const [toMin, toMax] = [-50, 100];
    return toMin + ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin);
  }
  scaleModFromBinaryValue(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    const multipliedValue = value * 1000;
    const inputMin = 0;
    const inputMax = 65535;
    const outputMin = -50;
    const outputMax = 100;

    const scaled =
      outputMin +
      ((multipliedValue - inputMin) * (outputMax - outputMin)) /
        (inputMax - inputMin);

    return scaled;
  }
  toFixed1(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    return parseFloat(value.toFixed(1));
  }
  scaleMODDaily(value: any) {
    if (detectValueType(value) !== 'number') return value.toString();
    if (value === 0) return 0;
    const [fromMin, fromMax] = [4, 20];
    const [toMin, toMax] = [-50, 100];
    return toMin + ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin);
  }
  binaryToVersion(value: any) {
    if (detectValueType(value) === 'number') return value.toString();

    if (value.length !== 32 || !/^[01]+$/.test(value)) {
      throw new InternalServerErrorException(
        'Input must be a 32-bit binary string (32 characters of 0s and 1s)',
      );
    }

    const octets = [
      value.substring(0, 8),
      value.substring(8, 16),
      value.substring(16, 24),
      value.substring(24, 32),
    ];
    const decimalOctets = octets.map((octet) => {
      return parseInt(octet, 2);
    });
    return decimalOctets.join('.');
  }
}
