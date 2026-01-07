import { EntityTypeUuidDto } from '../generals-uuid';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';

export class InitPlantEntity extends EntityTypeUuidDto {
  @ApiProperty({
    description: 'The unique tag of the plant entity',
    example: 'koshk1:Substation 1:Inverter 1',
  })
  @IsNotEmpty()
  @IsString()
  entityTag: string;
}

export class InitMultiplePlantEntityDto {
  @ApiProperty({
    description:
      'List of plant entities with their names, tags, and entity type UUIDs',
    type: [InitPlantEntity],
    example: [
      {
        entityTag: 'koshk1:Substation 1:Inverter 1',
        etUuid: 'a6232f52-793b-4848-b7ec-7842de60789f',
      },
      {
        entityTag: 'koshk1:Substation 1:Inverter 2',
        etUuid: 'a6232f52-793b-4848-b7ec-7842de60789f',
      },
      {
        entityTag: 'koshk1:Substation 1:Inverter 4',
        etUuid: 'a6232f52-793b-4848-b7ec-7842de60789f',
      },
      {
        entityTag: 'koshk1:Substation 1:Inverter 3',
        etUuid: 'a6232f52-793b-4848-b7ec-7842de60789f',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitPlantEntity)
  @UniqueCompositeFields(['entityTag'])
  data: InitPlantEntity[];

  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;
}
