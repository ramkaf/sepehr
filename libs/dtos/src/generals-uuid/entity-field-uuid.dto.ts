import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class EntityFieldUuidDto {
  @ApiProperty({
    description: 'UUID of the Entity field',
    example: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
  })
  @IsUUID()
  @IsNotEmpty()
  efUuid: string;
}
