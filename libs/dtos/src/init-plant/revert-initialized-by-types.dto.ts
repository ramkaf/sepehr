import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RevertInitializedByEntityTypeDto {
  @ApiProperty({
    description: 'UUID of the Entity Type',
    example: 'a6232f52-793b-4848-b7ec-7842de60789f',
  })
  @IsUUID()
  @IsNotEmpty()
  etUuid: string;

  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;
}
