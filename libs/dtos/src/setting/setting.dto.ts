import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AccessTypeEnum } from 'libs/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'UUID of the setting to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  settingUuid: string;

  @ApiProperty({
    description: 'Access type for this setting',
    enum: AccessTypeEnum,
    example: AccessTypeEnum.ADMIN,
  })
  @IsEnum(AccessTypeEnum)
  @IsNotEmpty()
  accessType: AccessTypeEnum;

  @ApiProperty({
    description: 'The value of the setting',
    example: 'dark_mode_enabled',
  })
  @IsString()
  @IsNotEmpty()
  settingValue: string;
}
