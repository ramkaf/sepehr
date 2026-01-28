import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChartTypeEnum, OperationTypeEnum } from 'libs/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChartDetailFieldDto {
  @ApiProperty({
    description: 'UUID of the chart details',
    example: '6e994396-de47-4d83-9371-4a50ca663906',
  })
  @IsUUID()
  @IsNotEmpty()
  chdUuid: string;

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
