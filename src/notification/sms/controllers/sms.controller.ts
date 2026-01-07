import { Controller } from '@nestjs/common';
import { SmsTemplateService } from '../providers/sms-template.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  NOTIFICATION_SMS_OTP,
  NOTIFICATION_SMS_PASSWORD_RESET,
  NOTIFICATION_SMS_WELCOME,
} from '@app/modules/messaging';
import { PatternSmsInputDto, WelcomeSmsInputDto } from 'libs/dtos';

@Controller()
export class SmsMicroserviceController {
  constructor(private readonly smsTemplateService: SmsTemplateService) {}

  @EventPattern(NOTIFICATION_SMS_WELCOME)
  async welcome(@Payload() payload: WelcomeSmsInputDto) {
    this.smsTemplateService.welcome(payload);
  }

  @EventPattern(NOTIFICATION_SMS_OTP)
  async otp(@Payload() payload: PatternSmsInputDto) {
    this.smsTemplateService.sendOtpSms(payload);
  }

  @EventPattern(NOTIFICATION_SMS_PASSWORD_RESET)
  async resetPassword(@Payload() payload: PatternSmsInputDto) {
    this.smsTemplateService.sendPassResetSms(payload);
  }
}
