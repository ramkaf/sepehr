import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  Validate,
  Matches,
} from 'class-validator';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'AtLeastOneFieldExists', async: false })
class AtLeastOneFieldExistsConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as LoginDto;
    return !!(object.email || object.username || object.mobile); // At least one should exist
  }

  defaultMessage(args: ValidationArguments) {
    return 'At least one of email, username, or phone must be provided.';
  }
}

export class LoginDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'ramkaf99@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Username for login',
    example: 'ramkaf',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Mobile number for login',
    example: '09183251795',
  })
  @IsOptional()
  @Matches(/^09\d{9}$/, {
    message: 'Mobile number must start with 09 and be 11 digits long',
  })
  mobile?: string;

  @ApiProperty({
    description: 'reCAPTCHA token for bot protection',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJlbWFpbCI6InNlcGVocnNjYWRhQGdtYWlsLmNvbSIsInBlcm1pc3Npb25zIjpbNywwLDEsMiwzLDQsNSw2XX0sImlhdCI6MTc0ODkzNTMyNiwiZXhwIjoxNzQ4OTcxMzI2fQ.dmIeke4ihcmiOFiMFCrEltwpN35C_w_siL9ift4qcB8',
  })
  @IsString()
  reCaptchaToken: string;

  @ApiProperty({
    description: 'User password',
    example: '321165ram',
  })
  @IsString()
  password: string;

  @Validate(AtLeastOneFieldExistsConstraint)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateAtLeastOneField() {}
}
