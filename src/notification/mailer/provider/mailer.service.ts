import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailTemplateManagerService } from './mail-template-manager.service';
import { NestConfigService } from 'libs/config';
import { SendEmailOptions } from 'libs/interfaces';
import { MailTemplateEnum, MailTemplateSubjects } from 'libs/enums';

@Injectable()
export class SmtpMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailTemplateManagerService: MailTemplateManagerService,
    private readonly configService: NestConfigService,
  ) {}

  async sendEmail(options: SendEmailOptions): Promise<any> {
    try {
      const result = await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });
      return result;
    } catch (error: any) {
      console.error('Error in sendMail Service', error);
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const emailContent =
      this.mailTemplateManagerService.mailHtmlTemplateGenerator(
        MailTemplateEnum.PASSWORD_FORGOT,
        {
          RESET_LINK: resetLink,
        },
      );
    this.sendEmail({
      to,
      subject: MailTemplateSubjects[MailTemplateEnum.PASSWORD_FORGOT],
      html: emailContent,
    });
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    const emailContent =
      this.mailTemplateManagerService.mailHtmlTemplateGenerator(
        MailTemplateEnum.OTP,
        {
          OTP_CODE: code,
        },
      );
    this.sendEmail({
      to,
      subject: MailTemplateSubjects[MailTemplateEnum.OTP],
      html: emailContent,
    });
  }

  async sendVerficationEmail(to: string, link: string): Promise<void> {
    const emailContent =
      this.mailTemplateManagerService.mailHtmlTemplateGenerator(
        MailTemplateEnum.EMAIL_VERIFICATION,
        {
          VERIFICATION_LINK: link,
        },
      );
    this.sendEmail({
      to,
      subject: MailTemplateSubjects[MailTemplateEnum.EMAIL_VERIFICATION],
      html: emailContent,
    });
  }

  async sendEventEmail(
    to: string,
    message: string,
    link: string,
  ): Promise<void> {
    const emailContent =
      this.mailTemplateManagerService.mailHtmlTemplateGenerator(
        MailTemplateEnum.SECURITY_ALERT,
        {
          ALERT_MESSAGE: message,
          EVENTS_LINK: link,
        },
      );
    this.sendEmail({
      to,
      subject: MailTemplateSubjects[MailTemplateEnum.SECURITY_ALERT],
      html: emailContent,
    });
  }

  async sendLetterEmail(
    to: string,
    title: string,
    content: string,
  ): Promise<void> {
    const emailContent =
      this.mailTemplateManagerService.mailHtmlTemplateGenerator(
        MailTemplateEnum.LETTER,
        {
          LETTER_DESCRIPTION: content,
          LETTER_TITLE: title,
        },
      );
    this.sendEmail({
      to,
      subject: MailTemplateSubjects[MailTemplateEnum.LETTER],
      html: emailContent,
    });
  }

  async sendBulkEmails(
    recipients: string[],
    subject: string,
    content: string,
  ): Promise<void> {
    for (const recipient of recipients) {
      await this.sendEmail({
        to: recipient,
        subject,
        html: content,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Method with attachments
  async sendEmailWithAttachment(
    to: string,
    subject: string,
    text: string,
    attachmentPath: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject,
      text,
      attachments: [
        {
          filename: 'document.pdf',
          path: attachmentPath,
        },
      ],
    });
  }
}
