import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TimeGroupTypeEnum } from 'libs/enums';

export class CreateChartDto {
  @ApiProperty({
    example: '09519653-0b13-415c-8ce7-0142f46ae9a0',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;

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
