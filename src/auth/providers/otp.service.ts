import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  generateRandomCode,
  getOtpRequestKeyByIp,
  getOtpRequestKeyByUser,
} from 'libs/utils';
import { JwtToolService } from './jwt.service';
import { ClientProxy } from '@nestjs/microservices';
import { OtpCacheEntry } from '../interfaces/auth.interface';
import { TwoFactorAuthenticatorService } from './2fa.service';
import {
  NOTIFICATION_MAILER_OTP,
  NOTIFICATION_RABBITMQ_SERVICE,
  NOTIFICATION_SMS_OTP,
} from '@app/modules/messaging';
import { RedisService, User } from 'libs/database';
import { SettingService, UserGlobalService } from 'libs/modules';
import { AccessTypeEnum, OtpMethodEnum, SettingKeysEnum } from 'libs/enums';
import { OtpLoginDto, PatternSmsInputDto } from 'libs/dtos';
import { IOtpEmailCredential, IUser } from 'libs/interfaces';

@Injectable()
export class Otpservice {
  constructor(
    private readonly redisService: RedisService,
    @Inject(NOTIFICATION_RABBITMQ_SERVICE)
    private readonly rabbitmqService: ClientProxy,
    private readonly settingService: SettingService,
    private readonly userGlobalService: UserGlobalService,
    private readonly jwtService: JwtToolService,
    private readonly twoFactorAuthenticatorService: TwoFactorAuthenticatorService,
  ) {}

  generateOtpPayload = () => {
    const otp = generateRandomCode('number', 6);
    const key = generateRandomCode('string', 64);
    return { otp, key };
  };

  async send(user: User, ip: string, key: string, otp: string): Promise<void> {
    const check = await this.checkAttempts(user, ip);
    if (check) {
      const { otpMethod } = user;
      switch (otpMethod) {
        case OtpMethodEnum.PHONE: {
          const { mobile } = user;
          const smsPayload: PatternSmsInputDto = {
            mobile,
            token: otp,
          };
          this.rabbitmqService.emit(NOTIFICATION_SMS_OTP, smsPayload);
          break;
        }

        case OtpMethodEnum.EMAIL: {
          const { email } = user;
          const data: IOtpEmailCredential = {
            to: email,
            otpCode: otp,
          };
          this.rabbitmqService.emit(NOTIFICATION_MAILER_OTP, data);
          break;
        }

        case OtpMethodEnum.GOOGLE_AUTHENTICATOR: {
          break;
        }

        case OtpMethodEnum.DISABLED: {
          break;
        }

        default:
          throw new Error('Invalid OTP method');
      }

      await this.save(user, otp, key);
      await this.saveAttempts(user, ip);
    }
  }
  async save(user: User, otp: string, key: string) {
    const ttlSeconds = await this.settingService.getTtlSettings(
      user.accessType.access,
      SettingKeysEnum.OtpExpiresAt,
    );
    const otpRedisStoredObject: OtpCacheEntry = {
      otp,
      try: 0,
      uuid: user.uuid,
      otpMethod: user.otpMethod,
    };
    await this.redisService.set(
      key,
      JSON.stringify(otpRedisStoredObject),
      ttlSeconds,
    );
  }
  async saveAttempts(user: User, ip: string): Promise<void> {
    await this.saveIPAttempt(ip);
    await this.saveUserAttempt(user);
  }
  async verify(otp: string, key: string): Promise<User> {
    const otpObj = await this.redisService.getObject(key);
    if (!otpObj)
      throw new UnauthorizedException(
        'The provided OTP is invalid or has expired.',
      );
    // const isValid = otp === otpObj.otp;
    const user = await this.userGlobalService.findOne(otpObj.uuid);
    if (!user)
      throw new UnauthorizedException(
        'The provided OTP is invalid or has expired.',
      );
    const check = await this.checkVerifyTry(key, user);

    if (!check)
      throw new ForbiddenException(
        'you reach maximom try for otp verification request',
      );
    switch (user.otpMethod) {
      case OtpMethodEnum.GOOGLE_AUTHENTICATOR: {
        const is2faValid =
          await this.twoFactorAuthenticatorService.verifyUserTwoFactorAuthenticator(
            user,
            otp,
          );
        if (!is2faValid) {
          await this.countVerifyTry(key);
          throw new UnauthorizedException('The provided 2fa is invalid.');
        }
        break;
      }

      case OtpMethodEnum.DISABLED: {
        const staticOtpValue = await this.settingService.getSettingValue(
          user.accessType.access,
          SettingKeysEnum.DisabledOtpStaticValue,
        );
        const isValid = staticOtpValue === otp;
        if (!isValid) {
          await this.countVerifyTry(key);
          throw new UnauthorizedException('The provided otp is invalid.');
        }
        break;
      }

      default: {
        const isOtpValid = otp === otpObj.otp;
        if (!isOtpValid) {
          await this.countVerifyTry(key);
          throw new UnauthorizedException('The provided OTP is invalid.');
        }
      }
    }

    if (!user?.isActive) {
      throw new ForbiddenException('User is disabled.');
    }

    await this.redisService.delete(key);
    return user;
  }
  async saveUserAttempt(user: User) {
    const ttlSeconds = await this.settingService.getTtlSettings(
      user.accessType.access,
      SettingKeysEnum.UserOtpAttemptTimeWindow,
    );
    const key = getOtpRequestKeyByUser(user);
    await this.saveAttempt(key, ttlSeconds);
  }
  async saveIPAttempt(ip: string) {
    const ttlSeconds = await this.settingService.getTtlSettings(
      AccessTypeEnum.GUEST,
      SettingKeysEnum.IpOtpAttemptTimeWindow,
    );
    const key = getOtpRequestKeyByIp(ip);
    await this.saveAttempt(key, ttlSeconds);
  }
  async countVerifyTry(key: string) {
    const cacheObject = await this.redisService.getObject(key);
    const updatedChacheObject = { ...cacheObject, try: cacheObject.try + 1 };
    await this.redisService.modify(key, JSON.stringify(updatedChacheObject));
  }
  async checkVerifyTry(key: string, user: User): Promise<boolean> {
    const allowedTry = await this.settingService.getNumberSetting(
      user.accessType.access,
      SettingKeysEnum.OtpVerificationTryCount,
    );
    const cacheObject = await this.redisService.getObject(key);
    if ((cacheObject?.try ?? 0) >= allowedTry) {
      throw new ForbiddenException(
        'You have exceeded the allowed number of OTP verification attempts. Please request a new OTP.',
      );
    }
    return true;
  }
  private async saveAttempt(key: string, ttlSeconds: number) {
    const exists = await this.redisService.exists(key);

    if (!exists) {
      const obj = { count: 1 };
      await this.redisService.set(key, JSON.stringify(obj), ttlSeconds);
    } else {
      const obj = await this.redisService.getObject(key);
      const updatedObj = { ...obj, count: obj.count + 1 };
      await this.redisService.modify(key, JSON.stringify(updatedObj));
    }
  }
  async checkAttempts(user: User, ip: string) {
    const userKey = getOtpRequestKeyByUser(user);
    const ipKey = getOtpRequestKeyByIp(ip);
    const userCacheObj = await this.redisService.getObject(userKey);
    const ipCacheObj = await this.redisService.getObject(ipKey);
    if (!userCacheObj && !ipCacheObj) return true;

    const allowedIpAttemptCount = await this.settingService.getNumberSetting(
      AccessTypeEnum.GUEST,
      SettingKeysEnum.IpOtpAttemptLimit,
    );
    const allowedUserAttemptCount = await this.settingService.getNumberSetting(
      user.accessType.access,
      SettingKeysEnum.UserOtpAttemptLimit,
    );

    if (userCacheObj?.count >= allowedUserAttemptCount)
      throw new ForbiddenException('OTP sending is restricted for this user');

    if (ipCacheObj?.count >= allowedIpAttemptCount)
      throw new ForbiddenException('OTP sending is restricted for this ip');

    return true;
  }
  async login(otpLoginDto: OtpLoginDto) {
    const { otp, key } = otpLoginDto;
    const user = (await this.verify(otp, key)) as unknown as IUser;
    const accessToken = await this.jwtService.getUserJwtToken(user);
    return { accessToken };
  }
}
