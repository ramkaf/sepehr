import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { NestConfigService } from 'libs/config';
@Injectable()
export class RecaptchaService {
  constructor(private readonly configService: NestConfigService) {}

  async googleRecaptchaValidate(token: string): Promise<boolean> {
    const secretKey = this.configService.recaptchaKey;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    try {
      const { data } = await axios.post(url);

      if (!data.success) {
        const isBrowserError = data['error-codes']?.includes('browser-error');
        throw new BadRequestException(
          isBrowserError
            ? 'Recaptcha verification failed, you cannot login behind a proxy or VPN'
            : 'Recaptcha verification failed',
        );
      }

      const isScoreValid = data.score && data.score > 0.5;
      if (!isScoreValid) {
        throw new BadRequestException(
          'Recaptcha validation failed due to low score',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) throw error; // preserve client errors
      throw new InternalServerErrorException('Recaptcha validation error');
    }
  }
  // async arvanCloudRecaptchaValidate(token: string): Promise<boolean> {
  //   try {
  //     const secret_key = process.env.ARCAPTCHA_SECRET_KEY;
  //     const site_key = process.env.ARCAPTCHA_SITE_KEY;
  //     const url = `https://api.arcaptcha.co/arcaptcha/api/verify`;
  //     const payload = {
  //       challenge_id: token,
  //       site_key,
  //       secret_key,
  //     };
  //     const response = await axios.post(url, payload, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.data.success) return true;
  //     const errorCodes = response.data['error-codes'] || [];
  //     if (errorCodes.includes('timeout-or-duplicate'))
  //       throw new UnauthorizedException(
  //         'ARCaptcha token expired or already used'
  //       );
  //     if (errorCodes.includes('invalid-input-response'))
  //       throw new BadRequestException('Invalid ARCaptcha response');
  //     if (errorCodes.includes('missing-input-response'))
  //       throw new BadRequestException('ARCaptcha token is missing');
  //   } catch (error) {
  //     throw new InternalServerErrorException('Recaptcha validation error');
  //   }
  // }
}
