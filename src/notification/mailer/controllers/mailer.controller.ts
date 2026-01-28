import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SmtpMailerService } from '../provider/mailer.service';
import {
  NOTIFICATION_MAILER_ALERT,
  NOTIFICATION_MAILER_OTP,
  NOTIFICATION_MAILER_PASSWORD_RESET,
  NOTIFICATION_MAILER_VERIFICATION_EMAIL,
} from '@app/modules/messaging';
import type {
  IEventAlertEmailCredential,
  ILetterEmailCredential,
  IOtpEmailCredential,
  IResetPasswordEmailCredential,
  IVerificationEmailCredential,
} from 'libs/interfaces';

@Controller()
export class SmtpMailerController {
  constructor(private readonly smtpMailerService: SmtpMailerService) {}
  @EventPattern(NOTIFICATION_MAILER_OTP)
  async otp(otpEmailCredential: IOtpEmailCredential) {
    const { to, otpCode } = otpEmailCredential;
    await this.smtpMailerService.sendOtpEmail(to, otpCode);
  }

  @EventPattern(NOTIFICATION_MAILER_ALERT)
  async alert(eventAlertEmailCredential: IEventAlertEmailCredential) {
    const { to, message, link } = eventAlertEmailCredential;
    await this.smtpMailerService.sendEventEmail(to, message, link);
  }

  @EventPattern(NOTIFICATION_MAILER_PASSWORD_RESET)
  async resetPassword(
    resetPasswordEmailCredential: IResetPasswordEmailCredential,
  ) {
    const { to, link } = resetPasswordEmailCredential;
    await this.smtpMailerService.sendPasswordResetEmail(to, link);
  }

  @EventPattern(NOTIFICATION_MAILER_VERIFICATION_EMAIL)
  async verifcationEmail(
    verificationEmailCredential: IVerificationEmailCredential,
  ) {
    const { to, link } = verificationEmailCredential;
    await this.smtpMailerService.sendPasswordResetEmail(to, link);
  }

  @EventPattern(NOTIFICATION_MAILER_VERIFICATION_EMAIL)
  async letter(letterEmailCredential: ILetterEmailCredential) {
    const { to, title, content } = letterEmailCredential;
    await this.smtpMailerService.sendLetterEmail(to, title, content);
  }
}
