import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntityTypeDto } from './create-entity-type.dto';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractionLevelEnum } from 'libs/enums';

export class CreateMultipleEntityTypeDto {
  @ApiProperty({
    type: [CreateEntityTypeDto],
    description: 'Array of entity types to create',
    example: [
      {
        name: 'Temperature Sensor',
        tag: 'temperature_sensor',
        description: 'Entity type used for monitoring temperature',
        abstractionLevel: AbstractionLevelEnum.SECTION, // adjust based on your AbstractionLevelEnum
        plantUuid: '09519653-0b13-415c-8ce7-0142f46ae9a0',
      },
      {
        name: 'Pressure Sensor',
        tag: 'pressure_sensor',
        description: 'Entity type used for monitoring pressure',
        abstractionLevel: AbstractionLevelEnum.SECTION,
        plantUuid: '09519653-0b13-415c-8ce7-0142f46ae9a0',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntityTypeDto)
  @UniqueCompositeFields(['tag'])
  data: CreateEntityTypeDto[];
}
