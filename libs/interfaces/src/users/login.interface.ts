import { OtpMethodEnum } from 'libs/enums';

export class ILogin {
  login: string;
  password: string;
  reCaptchaToken: string;
  ip: string;
}
export interface ILoginFirstStepResponse {
  key: string;
  otpMethod: OtpMethodEnum;
  mobile: string | null;
  email: string | null;
}
