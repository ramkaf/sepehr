import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateChartDetailFieldDto } from './create-chart-detail-field.dto';
import { ChartTypeEnum, OperationTypeEnum } from 'libs/enums';

export class CreateMultipleChartDetailFieldDto {
  @ApiProperty({
    type: [CreateChartDetailFieldDto],
    description: 'Array of chart detail fields to create',
    example: [
      {
        chdUuid: '6e994396-de47-4d83-9371-4a50ca663906',
        efUuid: '84ea65a2-28bc-4329-8627-60cc2f5e6250',
        unit: 'kWh',
        devideBy: 1000,
        oprType: OperationTypeEnum.AVG,
        chartType: ChartTypeEnum.AREA,
      },
      {
        chdUuid: '6e994396-de47-4d83-9371-4a50ca663906',
        efUuid: '76dcb407-734e-4e37-9000-2a75857469d3',
        unit: 'MW',
        devideBy: 1,
        oprType: OperationTypeEnum.AVG,
        chartType: ChartTypeEnum.AREA,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChartDetailFieldDto)
  data: CreateChartDetailFieldDto[];
}
