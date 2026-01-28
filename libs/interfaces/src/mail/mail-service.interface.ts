import { MailTemplateEnum } from 'libs/enums';
import { MailTemplateVariables } from './mail-template-variables.interface';

export interface MailServiceInputs<T extends MailTemplateEnum> {
  to: string | string[];
  vars: MailTemplateVariables[T];
}

export interface IOtpEmailCredential {
  to: string;
  otpCode: string;
}

export interface IEventAlertEmailCredential {
  to: string;
  message: string;
  link: string;
}

export interface IResetPasswordEmailCredential {
  to: string;
  link: string;
}
export interface IVerificationEmailCredential {
  to: string;
  link: string;
}

export interface ILetterEmailCredential {
  to: string;
  content: string;
  title: string;
}
