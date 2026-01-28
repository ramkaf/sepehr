import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccessTypeEnum, OtpMethodEnum } from 'libs/enums';
import { UuidDto } from '../../generals-uuid';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends UuidDto {
  @ApiProperty({
    example: 'John',
    description: 'Updated first name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Updated last name (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}
export class UpdateUserOtpMethodDto extends UuidDto {
  @ApiProperty({
    enum: OtpMethodEnum,
    example: OtpMethodEnum.EMAIL,
    description: 'New OTP method',
  })
  @IsNotEmpty()
  @IsEnum(OtpMethodEnum)
  otpMethod: OtpMethodEnum;
}

export class UpdateUserAccessTypeDto extends UuidDto {
  @ApiProperty({
    enum: AccessTypeEnum,
    example: AccessTypeEnum.USER,
    description: 'New access type',
  })
  @IsNotEmpty()
  @IsEnum(AccessTypeEnum)
  accessType: AccessTypeEnum;
}
