import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateChartDetailFieldDto } from './update-chart-detail-field.dto';

export class UpdateMultipleChartDetailFieldDto {
  @ApiProperty({
    type: [UpdateChartDetailFieldDto],
    description: 'Array of chart detail field to create',
    example: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChartDetailFieldDto)
  @UniqueCompositeFields(['uuid'])
  data: UpdateChartDetailFieldDto[];
}
