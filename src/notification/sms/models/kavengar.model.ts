import { Injectable } from '@nestjs/common';
import { KAVENEGAR_BASE_URL } from '../constants/constants';
import { SmsTemplateEnum } from 'libs/enums';

export class KavenegarAPI {
  private baseUrl = KAVENEGAR_BASE_URL;
  constructor(private apiKey: string) {}

  private formatReceptor(receptors: string | string[]): string {
    return Array.isArray(receptors) ? receptors.join(',') : receptors;
  }

  public generateApiUrl(
    type: 'sms',
    params: { receptor: string | string[]; sender: string; message: string },
  ): string;

  public generateApiUrl(
    type: 'verify',
    params: { receptor: string; token: string; template: SmsTemplateEnum },
  ): string;

  public generateApiUrl(type: 'sms' | 'verify', params: any): string {
    const base = `${this.baseUrl}/${this.apiKey}`;

    if (type === 'sms') {
      const receptor = this.formatReceptor(params.receptor);
      const url = new URL(`${base}/sms/send.json`);
      url.searchParams.set('receptor', receptor);
      url.searchParams.set('sender', params.sender);
      url.searchParams.set('message', params.message);
      return url.toString();
    }

    if (type === 'verify') {
      const url = new URL(`${base}/verify/lookup.json`);
      url.searchParams.set('receptor', params.receptor);
      url.searchParams.set('token', params.token);
      url.searchParams.set('template', params.template);
      return url.toString();
    }

    throw new Error('Invalid type');
  }
}
