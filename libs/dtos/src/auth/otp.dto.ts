import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpLoginDto {
  @ApiProperty({
    description: 'OTP code received by the user',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'Key used to identify OTP session',
    example: 'mMycFwazATgPrFhkmvKzXEwnKjKnETgEXmpfZbrKLazihxuhzvQEZcJkjIXsBeTd',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
