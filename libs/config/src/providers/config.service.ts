/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NestConfigService extends ConfigService {
  get appUrl(): string {
    return this.get<string>('APP_URL')!;
  }

  get pgHost(): string {
    return this.get<string>('POSTGRES_HOST')!;
  }

  get pgPort(): number {
    return this.get<number>('POSTGRES_PORT')!;
  }

  get pgUser(): string {
    return this.get<string>('POSTGRES_USER')!;
  }

  get pgPassword(): string {
    return this.get<string>('POSTGRES_PASSWORD')!;
  }
  get pgDb(): string {
    return this.get<string>('POSTGRES_DB')!;
  }
  get pgSynchronize(): string {
    return this.get<string>('POSTGRES_SYNCHRONIZE')!;
  }

  get pgLogging(): boolean {
    return this.get<string>('POSTGRES_LOGGING') === 'true';
  }

  // Redis Configuration
  get redisHost(): string {
    return this.get<string>('REDIS_HOST')!;
  }

  get redisPort(): number {
    return this.get<number>('REDIS_PORT')!;
  }

  get redisPassword(): string {
    return this.get<string>('REDIS_PASSWORD')!.replace('%24', '$');
  }

  //elasticsearch
  get elasticNode(): string {
    return this.get<string>('ELASTIC_NODE')!;
  }

  get elasticUser(): number {
    return this.get<number>('ELASTIC_USERNAME')!;
  }

  get elasticPassword(): string {
    return this.get<string>('ELASTIC_PASSWORD')!;
  }

  // JWT Configuration
  get jwtSecret(): string {
    return this.get<string>('JWT_SECRET')!;
  }
  get weatherApiKey(): string {
    return this.get<string>('WEATHER_API_KEY')!;
  }
  get recaptchaKey(): string {
    return this.get<string>('RECAPTCHA_KEY')!;
  }

  get jwtExpiresIn(): string {
    return this.get<string>('JWT_EXPIRES_IN')!;
  }

  get otpExpiresIn(): number {
    return this.get<number>('OTP_EXPIRES_IN')!;
  }
  // App Configuration
  get port(): number {
    return this.get<number>('PORT')!;
  }

  get nodeEnv(): string {
    return this.get<string>('NODE_ENV')!;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isStaging(): boolean {
    return this.nodeEnv === 'staging';
  }

  get kavenegarServiceApiKey(): string {
    return this.get<string>('KAVENEGARSERVICEAPIKEY')!;
  }

  get kavenegarSender1(): string {
    return this.get<string>('KAVENEGARSERVICESENDER1')!;
  }

  get kavenegarSender2(): string {
    return this.get<string>('KAVENEGARSERVICESENDER2')!;
  }

  get passwordSalt(): number {
    return this.get<number>('PASSWORD_SALT_ROUNDS')!;
  }

  get prExpiresIn(): number {
    return this.get<number>('PR_EXPIRES_IN ')!;
  }

  get smtpHost(): string {
    return this.get<string>('SMTP_HOST')!;
  }
  get smtpPort(): number {
    return this.get<number>('SMTP_PORT')!;
  }
  get smtpUser(): string {
    return this.get<string>('SMTP_USER')!;
  }
  get smtpPassword(): string {
    return this.get<string>('SMTP_PASSWORD')!;
  }

  get getARCaptchaSiteKey(): string {
    return this.get<string>('ARCAPTCHA_SITE_KEY')!;
  }
  get getARCaptchaSecretKey(): string {
    return this.get<string>('ARCAPTCHA_SECRET_KEY')!;
  }
}
