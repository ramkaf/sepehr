import { OtpMethodEnum } from 'libs/enums';

export interface Enable2FADto {
  token: string;
  secret: string;
  otpMethod: OtpMethodEnum;
}

export interface Disable2FADto {
  token: string;
}

export interface Change2FAMethodDto {
  currentToken: string;
  newMethod: OtpMethodEnum;
  newSecret?: string;
}

export interface OtpLoginWithBackupDto {
  otp: string;
  otp_key: string;
  isBackupCode?: boolean;
}
