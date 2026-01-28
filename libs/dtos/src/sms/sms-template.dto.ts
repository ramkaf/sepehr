import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class WelcomeSmsInputDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^09[012349]\d{8}$/, {
    message: 'Invalid Iranian mobile number format',
  })
  mobile: string;
}

export class PatternSmsInputDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^09[012349]\d{8}$/, {
    message: 'Invalid Iranian mobile number format',
  })
  mobile: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'code must contain only numbers' })
  token: string;
}
