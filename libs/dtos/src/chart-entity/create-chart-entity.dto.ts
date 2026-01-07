import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChartEntityDto {
  @ApiProperty({
    description: 'UUID of the Entity Type',
    example: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
  })
  @IsUUID()
  @IsNotEmpty()
  eUuid: string;

  @ApiProperty({
    description: 'UUID of the chart details',
    example: '9fec2750-7427-492b-a67c-6ad3cf8edc02',
  })
  @IsUUID()
  @IsNotEmpty()
  chdUuid: string;

  @IsOptional()
  @ApiProperty({
    description: 'title of the chart entities',
    example: 'title test',
  })
  @IsString()
  chartEntityTitle: string;
}
