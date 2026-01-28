import { IsString, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { AbstractionLevelEnum } from 'libs/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntityTypeDto {
  @ApiProperty({
    description: 'The display name of the entity type',
    example: 'Temperature Sensor',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A unique tag for the entity type',
    example: 'temperature_sensor',
  })
  @IsString()
  @IsNotEmpty()
  tag: string;

  @ApiProperty({
    description: 'A brief description of the entity type',
    example: 'Entity type used for monitoring temperature',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The abstraction level of the entity type',
    enum: AbstractionLevelEnum,
    example: AbstractionLevelEnum.SECTION, // replace with an actual enum value
  })
  @IsEnum(AbstractionLevelEnum)
  @IsNotEmpty()
  abstractionLevel: AbstractionLevelEnum;

  @ApiProperty({
    description: 'UUID of the plant this entity type belongs to',
    example: '09519653-0b13-415c-8ce7-0142f46ae9a0',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;
}
