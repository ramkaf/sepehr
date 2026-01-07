import { OtpMethodEnum } from 'libs/enums';
import { IRole } from './role.interface';

export interface IUser {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mobile: string;
  password?: string;
  isActive: boolean;
  otpMethod: OtpMethodEnum;
  role: IRole;
  twoFactorSecret?: string;
}
