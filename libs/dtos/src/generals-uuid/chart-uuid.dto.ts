import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChartUuidDto {
  @ApiProperty({
    description: 'UUID of the charts',
    example: 'c93c96a5-d18a-4cf2-bcc6-57e17af86549',
  })
  @IsUUID()
  @IsNotEmpty()
  chUuid: string;
}
