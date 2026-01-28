import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Otpservice } from '../providers/otp.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'libs/decorators';
import { OtpLoginDto } from 'libs/dtos';

@Controller('/auth/otp')
@ApiTags('otp')
export class OtpController {
  constructor(private readonly otpService: Otpservice) {}
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/verify')
  async verify(@Body() otpLoginDto: OtpLoginDto): Promise<Record<string, any>> {
    return await this.otpService.login(otpLoginDto);
  }
}
