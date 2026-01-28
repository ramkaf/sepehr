import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChartDetailUuidDto {
  @ApiProperty({
    description: 'UUID of the chart details',
    example: 'b6a42e06-7984-445a-9822-14f036c022a7',
  })
  @IsUUID()
  @IsNotEmpty()
  chdUuid: string;
}
