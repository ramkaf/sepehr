export enum MailTemplateEnum {
  SECURITY_ALERT = 'security-alert-template.html',
  PASSWORD_FORGOT = 'password-forgot-template.html',
  LETTER = 'letter-template.html',
  EMAIL_VERIFICATION = 'email-verification-template.html',
  OTP = 'otp-template.html',
}

export const MailTemplateSubjects: Record<
  keyof typeof MailTemplateEnum,
  string
> = {
  SECURITY_ALERT: 'Security Alert',
  PASSWORD_FORGOT: 'Password Reset Request',
  LETTER: 'Message from SEPEHRSCADA',
  EMAIL_VERIFICATION: 'Verify Your Email',
  OTP: 'Your Verification Code',
};
