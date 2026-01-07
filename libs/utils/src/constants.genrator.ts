import { User } from 'libs/database';

export function getOtpRequestKeyByUser(user: User): string {
  return `otp:request:user:${user.id}`;
}

export function getOtpRequestKeyByIp(ip: string): string {
  return `otp:request:ip:${ip}`;
}

export function getPasswordResetRequestKeyByUser(user: User): string {
  return `password-reset:request:user:${user.id}`;
}

export function ggetPasswordResetKeyByIp(ip: string): string {
  return `password-reset:request:ip:${ip}`;
}
