import { Type } from 'class-transformer';
import { UpdateEntityDto } from './update-entity.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMultipleEntityDto {
  @ApiProperty({
    description: 'Array of entities to update',
    type: [UpdateEntityDto],
    example: [
      {
        uuid: '974eeb3a-6d5d-45b4-8291-569fba6765e7',
        entityName: 'Updated Solar Panel A',
        parentInTreeId: 2,
      },
      {
        uuid: '974eeb3a-6d5d-45b4-8291-569fba6765e7',
        entityName: 'Updated Solar Panel B',
        parentInTreeId: 3,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEntityDto)
  data: UpdateEntityDto[];
}
