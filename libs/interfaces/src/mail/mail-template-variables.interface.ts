import { MailTemplateEnum } from 'libs/enums';

export interface MailTemplateVariables {
  [MailTemplateEnum.OTP]: {
    OTP_CODE: string;
  };
  [MailTemplateEnum.PASSWORD_FORGOT]: {
    RESET_LINK: string;
  };
  [MailTemplateEnum.SECURITY_ALERT]: {
    ALERT_MESSAGE: string;
    EVENTS_LINK: string;
  };
  [MailTemplateEnum.LETTER]: {
    LETTER_DESCRIPTION: string;
    LETTER_TITLE: string;
  };
  [MailTemplateEnum.EMAIL_VERIFICATION]: {
    VERIFICATION_LINK: string;
  };
}
