import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Otpservice } from '../providers/otp.service';
import { JwtToolService } from '../providers/jwt.service';
import { IUser } from 'libs/interfaces';

@Injectable()
export class OtpStrategy extends PassportStrategy(Strategy, 'otp') {
  constructor(
    private otpService: Otpservice,
    private jwtToolService: JwtToolService,
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { otp, key } = req.body;

    if (!otp || !key) {
      throw new BadRequestException('OTP and OTP key are required');
    }

    try {
      // Verify OTP using your existing service
      const user = (await this.otpService.verify(otp, key)) as unknown as IUser;

      // Generate JWT token for the authenticated user
      const token = await this.jwtToolService.getUserJwtToken(user);

      return {
        user,
        access_token: token,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid OTP');
    }
  }
}
