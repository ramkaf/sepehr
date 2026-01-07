import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeGroupTypeEnum } from 'libs/enums';

export class UpdateChartDto {
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
    example: 'Monthly Production Chart',
    description: 'Title of the chart',
  })
  @IsString()
  @IsNotEmpty()
  chartTitle: string;

  @ApiProperty({
    example: 'Shows production data over the past month',
    description: 'Description of the chart',
  })
  @IsString()
  @IsNotEmpty()
  chartDes: string;

  @ApiProperty({
    example: 1,
    description: 'Time group number for the chart (e.g., 1, 2, 3)',
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  timeGroup: number;

  @ApiProperty({
    example: TimeGroupTypeEnum.DAYS,
    description: 'Type of time grouping (seconds, minutes, hours, etc.)',
    enum: TimeGroupTypeEnum,
  })
  @IsEnum(TimeGroupTypeEnum)
  @IsNotEmpty()
  timeGroupType: TimeGroupTypeEnum;
}
