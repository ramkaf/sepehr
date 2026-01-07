import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { OtpMethodEnum } from 'libs/enums';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'john_doe123',
    description: 'Username (3-30 chars, lowercase, numbers, underscores)',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 30, {
    message: 'Username must be between 3 and 30 characters long',
  })
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'Username can only contain lowercase letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    example: '09123456789',
    description: 'Iranian mobile number (format: 09...)',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^09[012349]\d{8}$/, {
    message: 'Invalid Iranian mobile number format',
  })
  mobile: string;

  @ApiProperty({
    example: '02188776655',
    description: 'Iranian landline number (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^0[1-8][0-9]{2}[0-9]{7}$/, {
    message: 'Invalid Iranian landline number format',
  })
  phoneNumber: string;

  @ApiProperty({
    example: true,
    description: 'Whether user wants SMS alerts',
    default: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  haveSmsAlert: boolean;

  @ApiProperty({
    enum: OtpMethodEnum,
    example: OtpMethodEnum.PHONE,
    description: 'Preferred OTP method',
  })
  @IsNotEmpty()
  @IsEnum(OtpMethodEnum)
  otpPath: OtpMethodEnum;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Role UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  roleUuid: string;

  @ApiProperty({
    example: 'securePass123',
    description: 'Password (min 8 chars with at least 1 number)',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one number',
  })
  password: string;
}
