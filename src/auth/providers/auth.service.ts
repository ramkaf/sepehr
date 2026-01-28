// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtToolService } from './jwt.service';
import { PasswordService } from '../../user/providers/password.service';
import { RecaptchaService } from './recaptcha.service';
import { Otpservice } from './otp.service';
import { ILogin, ILoginFirstStepResponse } from 'libs/interfaces';
import { UserGlobalService } from 'libs/modules';
import { OtpMethodEnum } from 'libs/enums';
import { maskEmail, maskIranianPhone } from 'libs/utils';
import { User } from 'libs/database';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly userGlobalService: UserGlobalService,
    private readonly reCaptchaService: RecaptchaService,
    private readonly otpService: Otpservice,
    private readonly jwtToolService: JwtToolService,
  ) {}

  async login(loginCredential: ILogin): Promise<ILoginFirstStepResponse> {
    const { ip, reCaptchaToken } = loginCredential;
    // await this.reCaptchaService.googleRecaptchaValidate(reCaptchaToken)
    const { login, password } = loginCredential;
    const user = await this.validateCredentials(login, password);
    if (!user || user.isActive === false) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { key, otp } = this.otpService.generateOtpPayload();
    await this.otpService.send(user, ip, key, otp);
    const maskedMobile =
      user.otpMethod === OtpMethodEnum.PHONE
        ? maskIranianPhone(user.mobile)
        : null;
    const maskedEmail =
      user.otpMethod === OtpMethodEnum.EMAIL ? maskEmail(user.email) : null;
    return {
      key,
      otpMethod: user.otpMethod,
      mobile: maskedMobile,
      email: maskedEmail,
    };
  }

  async validateCredentials(login: string, password: string): Promise<User> {
    const user = await this.userGlobalService.findByCredentials(login);
    if (!user || !user?.password)
      throw new UnauthorizedException('Invalid Credentials');
    const compare = await this.passwordService.comparePasswords(
      password,
      user.password,
    );
    if (!compare) throw new UnauthorizedException('Invalid Credentials');
    return user;
  }
}
