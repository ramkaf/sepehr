import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UpdateEntityTypeDto } from './update-entity-type.dto';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMultipleEntityTypeDto {
  @ApiProperty({
    type: [UpdateEntityTypeDto],
    description: 'Array of entity types to update',
    example: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Temperature Sensor',
        description: 'Entity type used for monitoring temperature',
      },
      {
        uuid: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Pressure Sensor',
        description: 'Entity type used for monitoring pressure',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEntityTypeDto)
  @UniqueCompositeFields(['uuid'])
  data: UpdateEntityTypeDto[];
}
