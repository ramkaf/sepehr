import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import {
  BrowserGroupEnum,
  EntityFieldTypeEnum,
  MaskFunctionsEnum,
} from 'libs/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEntityFieldDto {
  @ApiProperty({
    description: 'The display title of the field',
    example: 'Voltage',
  })
  @IsString()
  @IsNotEmpty()
  fieldTitle: string;

  @ApiProperty({
    description: 'Unique tag for the field (no spaces)',
    example: 'voltage_tag',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S*$/, { message: 'field_tag must not contain spaces' })
  fieldTag: string;

  @ApiPropertyOptional({ description: 'Measurement unit', example: 'V' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Whether the field is computational',
    example: false,
  })
  @IsBoolean()
  isComputational: boolean;

  @ApiPropertyOptional({
    description: 'Function name for last value calculation',
  })
  @IsOptional()
  lastValueFunctionName?: string;

  @ApiPropertyOptional({
    description: 'Function name for all values calculation',
  })
  @IsOptional()
  allValuesFunctionName?: string;

  @ApiProperty({
    description: 'Group(s) this field belongs to',
    enum: BrowserGroupEnum,
    isArray: true,
    example: [BrowserGroupEnum.PARAMETERS, BrowserGroupEnum.STATE],
  })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(BrowserGroupEnum, { each: true })
  browserGroup: BrowserGroupEnum[];

  @ApiProperty({ description: 'Whether the field is static', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isStatic: boolean;

  @ApiPropertyOptional({
    description: 'Static value if field is static',
    example: '100',
  })
  @IsOptional()
  staticValue?: string;

  @ApiPropertyOptional({ description: 'Mask function if applicable' })
  @IsOptional()
  maskFunction?: MaskFunctionsEnum;

  @ApiProperty({
    description: 'Type of the field',
    enum: EntityFieldTypeEnum,
    example: EntityFieldTypeEnum.VALUE,
  })
  @IsEnum(EntityFieldTypeEnum)
  @IsNotEmpty()
  fieldType: EntityFieldTypeEnum;

  @ApiProperty({ description: 'Whether the field is enabled', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isEnabled: boolean;

  @ApiProperty({
    description: 'UUID of the Entity Type',
    example: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
  })
  @IsUUID()
  @IsNotEmpty()
  etUuid: string;
}
