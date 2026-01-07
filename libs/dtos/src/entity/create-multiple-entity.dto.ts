import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntityDto } from './create-entity.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMultipleEntityDto {
  @ApiProperty({
    description: 'Array of entities to create',
    type: [CreateEntityDto],
    example: [
      {
        etUuid: 'dc750961-55c1-4949-9d16-23c28bc50894',
        entityName: 'Solar Panel A',
        entityTag: 'SP-A-001',
        parentInTreeId: 1,
      },
      {
        etUuid: 'dc750961-55c1-4949-9d16-23c28bc50894',
        entityName: 'Solar Panel B',
        entityTag: 'SP-B-002',
        parentInTreeId: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntityDto)
  data: CreateEntityDto[];
}
