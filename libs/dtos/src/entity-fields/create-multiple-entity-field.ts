import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntityFieldDto } from './create-entity-fields.dto';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMultipleEntityFieldDto {
  @ApiProperty({
    description: 'Array of entity fields to create',
    type: [CreateEntityFieldDto],
    example: [
      {
        fieldTitle: 'Voltage',
        fieldTag: 'voltage',
        unit: 'V',
        isComputational: false,
        browserGroup: ['Parameters'],
        isStatic: false,
        fieldType: 'Value',
        isEnabled: true,
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        fieldTitle: 'Status',
        fieldTag: 'status',
        isComputational: false,
        browserGroup: ['State'],
        isStatic: true,
        staticValue: 'ON',
        fieldType: 'Binary',
        isEnabled: true,
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntityFieldDto)
  @UniqueCompositeFields(['fieldTag'])
  data: CreateEntityFieldDto[];
}
