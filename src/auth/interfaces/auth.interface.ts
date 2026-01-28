import { OtpMethodEnum } from 'libs/enums';

export interface VerifyOtpResult {
  success: boolean;
  userId: number | null;
}

export interface OtpCacheEntry {
  uuid: string;
  otp: string;
  try: number;
  otpMethod: OtpMethodEnum;
}
