import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { KavenegarAPI } from '../models/kavengar.model';
import { NestConfigService } from 'libs/config';
import { SmsTemplateEnum } from 'libs/enums';

@Injectable()
export class SmsDeliveryService {
  private readonly kavenegar: KavenegarAPI;

  constructor(private readonly configService: NestConfigService) {
    this.kavenegar = new KavenegarAPI(
      this.configService.kavenegarServiceApiKey,
    );
  }

  async send(
    message: string,
    sender: string,
    mobile: string | string[],
  ): Promise<boolean> {
    const url = this.kavenegar.generateApiUrl('sms', {
      message,
      sender,
      receptor: mobile,
    });
    try {
      const response = await axios.get(url);
      if (response.data.return.status === 200) return true;
      return false;
    } catch (error) {
      console.error('Failed to send SMS:', error?.response?.data || error);
      throw error;
    }
  }

  async sendOtp(
    token: string,
    mobile: string,
    template = SmsTemplateEnum.VERIFY,
  ): Promise<boolean> {
    const url = this.kavenegar.generateApiUrl('verify', {
      receptor: mobile,
      token,
      template,
    });
    try {
      const response = await axios.get(url, {
        headers: {
          Host: 'api.kavenegar.com',
          'User-Agent': 'PostmanRuntime/7.44.1',
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
        },
      });
      if (response.data.return.status === 200) return true;
      return false;
    } catch (error) {
      console.error('OTP send failed:', error?.response?.data || error);
      throw error;
    }
  }
}
