import { IntersectionType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  BrowserGroupEnum,
  EntityFieldTypeEnum,
  MaskFunctionsEnum,
} from 'libs/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEntityFieldDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID v4 format',
    format: 'uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  uuid: string;

  @ApiPropertyOptional({
    description: 'The display title of the field',
    example: 'Updated Voltage',
  })
  @IsOptional()
  @IsString()
  fieldTitle?: string;

  @ApiPropertyOptional({ description: 'Measurement unit', example: 'V' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: 'Whether the field is computational',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isComputational?: boolean;

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

  @ApiPropertyOptional({
    description: 'Group(s) this field belongs to',
    enum: BrowserGroupEnum,
    isArray: true,
    example: [BrowserGroupEnum.PARAMETERS, BrowserGroupEnum.STATE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BrowserGroupEnum, { each: true })
  browserGroup?: BrowserGroupEnum[];

  @ApiPropertyOptional({
    description: 'Whether the field is static',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isStatic?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the field is enable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Static value if field is static',
    example: '100',
  })
  @IsOptional()
  staticValue?: string;

  @ApiPropertyOptional({ description: 'Mask function if applicable' })
  @IsOptional()
  maskFunction?: MaskFunctionsEnum;

  @ApiPropertyOptional({
    description: 'Type of the field',
    enum: EntityFieldTypeEnum,
    example: EntityFieldTypeEnum.VALUE,
  })
  @IsOptional()
  @IsEnum(EntityFieldTypeEnum)
  fieldType?: EntityFieldTypeEnum;
}
