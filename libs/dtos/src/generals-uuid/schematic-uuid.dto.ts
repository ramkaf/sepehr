import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class SchematicUuidDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'UUID of the Schematics',
    example: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
  })
  schUuid: string;
}
