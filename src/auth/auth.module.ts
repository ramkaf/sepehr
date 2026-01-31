// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtToolService } from './providers/jwt.service';
import { UserModule } from '../user/user.module';
import {
  SettingModule,
  SettingService,
  UserGlobalModule,
  AlarmConfigsModule,
} from 'libs/modules';
import { PasswordController } from './controllers/password.controller';
import { RecaptchaService } from './providers/recaptcha.service';
import { Otpservice } from './providers/otp.service';
import { OtpController } from './controllers/otp.controller';
import { OtpStrategy } from './strategies/otp.strategy';
import { PasswordService } from '../user/providers/password.service';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { TwoFactorAuthenticatorController } from './controllers/2fa.controller';
import { TwoFactorAuthenticatorService } from './providers/2fa.service';
import { NestConfigModule, NestConfigService } from 'libs/config';
import { PostgresModule, RedisModule } from 'libs/database';
import {
  ADMIN_DASHBOARD_RABBITMQ_QUEUE,
  ADMIN_DASHBOARD_RABBITMQ_SERVICE,
  NOTIFICATION_RABBITMQ_QUEUE,
  NOTIFICATION_RABBITMQ_SERVICE,
  RabbitMQModule,
} from '@app/modules/messaging';
import {  ResponseFormatterService } from 'libs/logger';
// import {StringValue} from 'jsonwe'
@Module({
  imports: [
    NestConfigModule,
    SettingModule,
    PostgresModule,
    AlarmConfigsModule,
    RabbitMQModule.register([
      {
        name: NOTIFICATION_RABBITMQ_SERVICE,
        queue: NOTIFICATION_RABBITMQ_QUEUE,
      },
      {
        name: ADMIN_DASHBOARD_RABBITMQ_SERVICE,
        queue: ADMIN_DASHBOARD_RABBITMQ_QUEUE,
      },
    ]),
    UserModule,
    UserGlobalModule,
    JwtModule.registerAsync({
      imports: [NestConfigModule, SettingModule],
      inject: [NestConfigService, SettingService],
      useFactory: async (
        configService: NestConfigService,
        settingService: SettingService,
      ) => {
        // let expiresIn = await settingService.getSettingValue(
        //   AccessTypeEnum.GUEST,
        //   'jwtExpirationSeconds'
        // );
        // if (!expiresIn)
        //   expiresIn = '5h'
        return {
          secret: configService.jwtSecret,
          signOptions: {
            expiresIn: '5h',
          },
        };
      },
    }),
    RedisModule,
    // ThrottlerModule.forRootAsync({
    //   imports: [SettingModule],
    //   inject: [SettingService],
    //   useFactory: async (
    //     settingService: SettingService
    //   ): Promise<ThrottlerModuleOptions> => {
    //     const ttl = await settingService.getNumberSetting(
    //       AccessTypeEnum.GUEST,
    //       SettingKeysEnum.RateLimiterLimitPublic
    //     );
    //     const limit = await settingService.getNumberSetting(
    //       AccessTypeEnum.GUEST,
    //       SettingKeysEnum.RateLimiterLimitPublic
    //     );
    //     return [
    //       {
    //         ttl,
    //         limit,
    //       },
    //     ];
    //   },
    // }),
  ],
  controllers: [
    AuthController,
    PasswordController,
    OtpController,
    TwoFactorAuthenticatorController,
  ],
  providers: [
    ResponseFormatterService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    OtpStrategy,
    JwtToolService,
    RecaptchaService,
    Otpservice,
    PasswordService,
    TwoFactorAuthenticatorService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
