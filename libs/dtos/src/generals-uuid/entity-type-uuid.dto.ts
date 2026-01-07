import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class EntityTypeUuidDto {
  @ApiProperty({
    description: 'UUID of the Entity Type',
    example: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
  })
  @IsUUID()
  @IsNotEmpty()
  etUuid: string;
}
