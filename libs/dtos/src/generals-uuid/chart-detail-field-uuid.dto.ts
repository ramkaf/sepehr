import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChartDetailFieldUuidDto {
  @ApiProperty({
    description: 'UUID of the charts detail fields',
    example: 'b6a42e06-7984-445a-9822-14f036c022a7',
  })
  @IsUUID()
  @IsNotEmpty()
  chdfUuid: string;
}
