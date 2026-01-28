import {
  IsString,
  MinLength,
  Matches,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  ValidatorConstraint,
  IsOptional,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MatchPasswordsConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as PasswordResetDto;
    return object.password === value;
  }

  defaultMessage(_: ValidationArguments) {
    return 'Confirm password must match the password.';
  }
}

@ValidatorConstraint({ name: 'AtLeastOne', async: false })
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    return !!(object['email'] || object['mobile'] || object['username']);
  }

  defaultMessage(_: ValidationArguments) {
    return 'At least one of email, phone, or username must be provided.';
  }
}

export class PasswordResetDto {
  @ApiProperty({
    example: 'Password123',
    description:
      'Password must be at least 8 characters long and contain at least one number.',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @Matches(/^(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one number',
  })
  password: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Must match the password field.',
  })
  @IsString()
  @IsNotEmpty()
  @Validate(MatchPasswordsConstraint)
  confirmPassword: string;

  @ApiProperty({
    example: 'reset-key-12345',
    description: 'The reset key sent to the user.',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: '789654',
    description: 'The verification code sent to the user.',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class PasswordResetCredentialDto {
  @ApiPropertyOptional({
    example: 'ramkaf99@gmail.com',
    description: 'User email address.',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({
    example: '09183251795',
    description: 'Iranian mobile number format.',
  })
  @IsOptional()
  @Matches(/^09[012349]\d{8}$/, {
    message: 'Invalid Iranian mobile number format',
  })
  mobile?: string;

  @ApiPropertyOptional({
    example: 'ramkaf',
    description: 'Username of the account.',
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  username?: string;

  @Validate(AtLeastOneFieldConstraint, {
    message: 'At least one of email, phone, or username must be provided.',
  })
  atLeastOneField!: boolean; // Only for validation
}
