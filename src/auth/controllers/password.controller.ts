// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { PasswordService } from '../../user/providers/password.service';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PasswordResetDto, PasswordResetCredentialDto } from 'libs/dtos';
import { Public } from 'libs/decorators';

@Controller('auth/password-reset')
@ApiTags('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Public()
  @Post('/send')
  @HttpCode(HttpStatus.OK)
  async send(
    @Body() passwordResetCredentialDto: PasswordResetCredentialDto,
    @Req() req: Request,
  ) {
    return await this.passwordService.send(passwordResetCredentialDto, req);
  }

  @Public()
  @Post('/reset')
  @HttpCode(HttpStatus.OK)
  async reset(@Body() passwordResetDto: PasswordResetDto) {
    return await this.passwordService.reset(passwordResetDto);
  }
}
