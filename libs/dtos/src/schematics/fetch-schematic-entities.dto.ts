import { IsUUID, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityTypeUuidDto, UuidDto } from '../generals-uuid';
import { boolean } from 'joi';

export class FetchSchematicEntities extends EntityTypeUuidDto {
  @ApiProperty({
    example: true,
    description: 'get entities with substations',
  })
  @IsBoolean()
  withSubs: boolean;
}
