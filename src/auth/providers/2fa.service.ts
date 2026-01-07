import { BadRequestException, Injectable } from '@nestjs/common';
import speakeasy from 'speakeasy';
import { UserService } from '../../user/providers/user.service';
import { SettingService, UserGlobalService } from 'libs/modules';
import { ITwoFactorSecret } from 'libs/interfaces';
import { SettingKeysEnum } from 'libs/enums';
import { User } from 'libs/database';
@Injectable()
export class TwoFactorAuthenticatorService {
  constructor(
    private readonly userService: UserService,
    private readonly userGlobalService: UserGlobalService,
    private readonly settingService: SettingService,
  ) {}

  async generateUserSecret(uuid: string): Promise<ITwoFactorSecret> {
    const user = await this.userGlobalService.findOne(uuid);
    if (!user) throw new BadRequestException('user not found');
    const [authenticatorAppName, authenticatorSecretLength] = await Promise.all(
      [
        this.settingService.getSettingValue(
          user.accessType.access,
          SettingKeysEnum.AuthenticatorName,
        ),
        this.settingService.getSettingValue(
          user.accessType.access,
          SettingKeysEnum.AuthenticatorSecretLength,
        ),
      ],
    );
    const secret = speakeasy.generateSecret({
      name: authenticatorAppName, // this is shown in the authenticator app
      length: authenticatorSecretLength, // optional, default is 32
    });
    Object.assign(user, {
      twoFactorSecret: secret.base32A,
      twoFactorEnabled: true,
    });
    await this.userService.save(user);
    return secret;
  }
  async verifyUserTwoFactorAuthenticator(
    user: User,
    otp: string,
  ): Promise<boolean> {
    const { twoFactorSecret, twoFactorEnabled } = user;
    if (!twoFactorSecret || twoFactorEnabled === false) {
      throw new BadRequestException(
        'Two-factor authentication is not enabled for this user.',
      );
    }
    return this.verifyToken(twoFactorSecret, otp);
  }

  async verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      token,
      encoding: 'base32',
    });
  }
}
