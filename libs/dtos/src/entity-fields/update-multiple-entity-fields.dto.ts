import { Type } from 'class-transformer';
import { UpdateEntityFieldDto } from './update-entity-field.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMultipleEntityFieldDto {
  @ApiProperty({
    description: 'Array of entity fields to update',
    type: [UpdateEntityFieldDto],
    example: [
      {
        uuid: 'f2a7e1d4-63e9-43a8-a26f-45b21c1d9f8a',
        fieldTitle: 'Updated Voltage',
        isEnabled: false,
      },
      {
        uuid: 'b7c3d4f2-12a7-41ab-9a7d-88d1a2e9b7c2',
        fieldTitle: 'Updated Status',
        isStatic: false,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEntityFieldDto)
  @UniqueCompositeFields(['uuid'])
  data: UpdateEntityFieldDto[];
}
