import { Injectable } from '@nestjs/common';
import { SmsDeliveryService } from './sms-delivery.service';
import { PatternSmsInputDto, WelcomeSmsInputDto } from 'libs/dtos';
import { NestConfigService } from 'libs/config';
import { SmsTemplateEnum } from 'libs/enums';

@Injectable()
export class SmsTemplateService {
  constructor(
    private readonly configService: NestConfigService,
    private readonly smsDeliveryService: SmsDeliveryService,
  ) {}

  async welcome(input: WelcomeSmsInputDto) {
    const sms = `به سامانه پایش هوشمند راهبر خوش آمدید.`;
    const sender = this.configService.kavenegarSender1;
    return this.smsDeliveryService.send(sms, sender, input.mobile);
  }

  async sendOtpSms(input: PatternSmsInputDto) {
    return this.smsDeliveryService.sendOtp(
      input.token,
      input.mobile,
      SmsTemplateEnum.VERIFY,
    );
  }

  async sendPassResetSms(input: PatternSmsInputDto) {
    return this.smsDeliveryService.sendOtp(
      input.token,
      input.mobile,
      SmsTemplateEnum.PASSRESET,
    );
  }
}
