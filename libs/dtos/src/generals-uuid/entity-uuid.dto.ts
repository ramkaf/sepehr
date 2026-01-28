import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class EntityUuidDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'UUID of the Entity Type',
    example: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
  })
  eUuid: string;
}

export class EntityUuidOptioanlDto {
  @IsOptional()
  @IsUUID()
  eUuid?: string;
}
