import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TwoFactorAuthenticatorService } from '../providers/2fa.service';
import { ApiTags } from '@nestjs/swagger';
import { generateQrcode } from 'libs/utils';

@Controller('/auth/2fa')
@ApiTags('2fa')
export class TwoFactorAuthenticatorController {
  constructor(
    private readonly twoFactorAuthenticatorService: TwoFactorAuthenticatorService,
  ) {}

  @Get()
  async generateSecret(
    @Req() req: Request,
  ): Promise<{ qrCode: string; secret: string }> {
    const { id: userUuid } = req.user!;
    const result =
      await this.twoFactorAuthenticatorService.generateUserSecret(userUuid);
    const { otpauth_url, base32 } = result;
    const qrCode = await generateQrcode(otpauth_url);
    return { qrCode, secret: base32 };
  }
}
