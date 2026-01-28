import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateChartEntityDto } from './create-chart-entity.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMultipleChartEntityDto {
  @ApiProperty({
    description: 'Array of chart entities',
    type: [CreateChartEntityDto],
    example: [
      {
        eUuid: '942ed2d2-c8fd-4bde-b1f7-ca40ae0845d7',
        chdUuid: 'ed4e14c8-64e3-4c87-834e-4bf5ac7387a3',
        chartEntityTitle: 'Sales Performance Q1',
      },
      {
        eUuid: '09519653-0b13-415c-8ce7-0142f46ae9a0',
        chdUuid: 'ebd301c5-0750-416b-bd29-e978c0a7f9eb',
        chartEntityTitle: 'Customer Growth Q1',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChartEntityDto)
  data: CreateChartEntityDto[];
}
