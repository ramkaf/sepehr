import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../user/providers/user.service';
import { ClientProxy } from '@nestjs/microservices';
import { PasswordResetCacheEntry } from '../interfaces/password.interface';
import { Request } from 'express';
import {
  NOTIFICATION_RABBITMQ_SERVICE,
  NOTIFICATION_SMS_PASSWORD_RESET,
} from '@app/modules/messaging';
import { SettingService, UserGlobalService } from 'libs/modules';
import { NestConfigService } from 'libs/config';
import { RedisService, User } from 'libs/database';
import {
  PasswordResetDto,
  PasswordResetCredentialDto,
  PatternSmsInputDto,
} from 'libs/dtos';
import { AccessTypeEnum, SettingKeysEnum } from 'libs/enums';
import {
  generateRandomCode,
  getPasswordResetRequestKeyByUser,
  ggetPasswordResetKeyByIp,
  maskIranianPhone,
} from 'libs/utils';
@Injectable()
export class PasswordService {
  private readonly saltRounds: number;
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(NOTIFICATION_RABBITMQ_SERVICE)
    private readonly rabbitmqService: ClientProxy,
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => UserGlobalService))
    private readonly userGlobalService: UserGlobalService,
    private readonly configService: NestConfigService,
    private readonly redisService: RedisService,
  ) {
    this.saltRounds = this.configService.passwordSalt;
  }

  public async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Error hashing password');
    }
  }
  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
  public async send(
    passwordResetCredentialDto: PasswordResetCredentialDto,
    req: Request,
  ) {
    const credential =
      passwordResetCredentialDto.email ||
      passwordResetCredentialDto.mobile ||
      passwordResetCredentialDto.username;
    if (!credential) throw new BadRequestException('credential is not found');
    const ip = req.ip;
    if (!ip) throw new BadRequestException('user is not found');
    const user = await this.userGlobalService.findByCredentials(credential);
    if (!user) throw new NotFoundException('Invalid credentials');
    await this.checkAttempts(user, ip);
    const { code, key } = this.generatePassResetSMSKey();
    const smsObj: PatternSmsInputDto = {
      mobile: user.mobile,
      token: code,
    };
    this.rabbitmqService.emit(NOTIFICATION_SMS_PASSWORD_RESET, smsObj);
    await this.save(code, key, user);
    await this.saveAttempts(user, ip);
    return {
      key,
      mobile: maskIranianPhone(user.mobile),
    };
  }
  public async reset(PasswordResetDto: PasswordResetDto) {
    const { key, code, password, confirmPassword } = PasswordResetDto;
    if (password !== confirmPassword)
      throw new BadRequestException(
        'Password and Confirm Password do not match',
      );

    const cachedObj = await this.redisService.get(key);

    if (!cachedObj)
      throw new BadRequestException('Invalid Password Reset Token provided');

    const passRestObj = JSON.parse(cachedObj);
    const user = await this.userGlobalService.findOne(passRestObj.uuid);
    if (!user || user.isActive === false)
      throw new BadRequestException('Invalid Password Reset Token provided');
    await this.checkVerifyTry(key, user);
    const isValid = passRestObj.code === code;
    if (!isValid) {
      this.countVerifyTry(key);
      throw new BadRequestException('Invalid Password Reset Token provided');
    }
    const hashPassword = await this.hashPassword(password);
    Object.assign(user, { password: hashPassword });
    await this.userService.save(user);
    await this.redisService.delete(key);
    return 'Password successfully changed.';
  }
  public async save(code: string, key: string, user: User) {
    const ttlSeconds = await this.settingService.getTtlSettings(
      user.accessType.access,
      SettingKeysEnum.PasswordResetTokenExpiresAt,
    );
    const passwordResetRedisObject: PasswordResetCacheEntry = {
      code,
      try: 0,
      key,
      uuid: user.uuid,
    };
    await this.redisService.set(
      key,
      JSON.stringify(passwordResetRedisObject),
      ttlSeconds,
    );
  }
  async saveAttempts(user: User, ip: string): Promise<void> {
    await this.saveIPAttempt(ip);
    await this.saveUserAttempt(user);
  }
  public generatePassResetSMSKey() {
    const key = generateRandomCode('string', 96);
    const code = generateRandomCode('number', 6);
    return { code, key };
  }
  async changePassword(user: User, password: string): Promise<boolean> {
    const hash = await this.hashPassword(password);
    await this.userService.updatePassword(user.uuid, hash);
    return true;
  }
  async saveUserAttempt(user: User) {
    const ttlSeconds = await this.settingService.getTtlSettings(
      user.accessType.access,
      SettingKeysEnum.UserPasswordResetAttemptTimeWindow,
    );
    const key = getPasswordResetRequestKeyByUser(user);
    await this.saveAttempt(key, ttlSeconds);
  }
  async saveIPAttempt(ip: string) {
    const ttlSeconds = await this.settingService.getTtlSettings(
      AccessTypeEnum.GUEST,
      SettingKeysEnum.IpPasswordResetAttemptTimeWindow,
    );
    const key = ggetPasswordResetKeyByIp(ip);
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
      SettingKeysEnum.PasswordResetVerificationTryCount,
    );
    const cacheObject = await this.redisService.getObject(key);
    if ((cacheObject?.try ?? 0) >= allowedTry) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
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
    const userKey = getPasswordResetRequestKeyByUser(user);
    const ipKey = ggetPasswordResetKeyByIp(ip);
    const userCacheObj = await this.redisService.getObject(userKey);
    const ipCacheObj = await this.redisService.getObject(ipKey);
    if (!userCacheObj && !ipCacheObj) return true;

    const allowedIpAttemptCount = await this.settingService.getNumberSetting(
      AccessTypeEnum.GUEST,
      SettingKeysEnum.IpPasswordResetAttemptLimit,
    );
    const allowedUserAttemptCount = await this.settingService.getNumberSetting(
      user.accessType.access,
      SettingKeysEnum.UserPasswordResetAttemptLimit,
    );

    if (userCacheObj?.count >= allowedUserAttemptCount)
      throw new HttpException(
        'PASSWORD RESET Token sending is restricted for this user',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    if (ipCacheObj?.count >= allowedIpAttemptCount)
      throw new HttpException(
        'PASSWORD RESET Token sending is restricted for this ip',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    return true;
  }
}
