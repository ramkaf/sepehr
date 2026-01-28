// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './../providers/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'libs/decorators';
import { AlarmConfigService } from 'libs/modules';
import { LoginDto } from 'libs/dtos';

@Controller('auth')
@ApiTags('authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly alservice: AlarmConfigService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  async login(@Req() request: Request, @Body() loginDto: LoginDto) {
    const login = loginDto.email || loginDto.username || loginDto.mobile;
    if (!login) throw new BadRequestException('credential is invalid');
    const { password, reCaptchaToken } = loginDto;
    const ip = request.ip;
    if (!ip) throw new BadRequestException('credential is invalid');
    return await this.authService.login({
      login,
      password,
      reCaptchaToken,
      ip,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/test')
  async test() {
    return this.alservice.findOne('d7ec7a67-976a-4b40-b551-47276711bc73');
  }
}
