import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChartTypeEnum, OperationTypeEnum } from 'libs/enums';

export class UpdateChartDetailFieldDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID v4 format',
    format: 'uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  uuid: string;

  @ApiProperty({
    description: 'UUID of the entity field',
    example: 'b453d6fb-6480-407e-9c84-386d8f2ed0f7',
  })
  @IsNotEmpty()
  @IsUUID()
  efUuid: string;

  @ApiProperty({
    description: 'Unit of measurement (optional)',
    example: 'kWh',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Value to divide the metric by (optional)',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  devideBy?: number;

  @ApiProperty({
    description: 'Operation type applied on the field (optional)',
    enum: OperationTypeEnum,
    example: OperationTypeEnum.SUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(OperationTypeEnum)
  oprType?: OperationTypeEnum;

  @ApiProperty({
    description: 'Chart type for visualization (optional)',
    enum: ChartTypeEnum,
    example: ChartTypeEnum.LINE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChartTypeEnum)
  chartType?: ChartTypeEnum;
}
