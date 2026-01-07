import { ApiProperty } from '@nestjs/swagger';
import { PlantUuidDto } from '../generals-uuid';
import { UniqueCompositeFields } from '../generals';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class InitPlantEntityTypes {
  @ApiProperty({
    description: 'Unique tag name of the plant entity type',
    example: 'Inverter',
  })
  @IsString()
  @IsNotEmpty()
  tag: string;
}

export class InitMultiplePlantEntityTypesDto {
  @ApiProperty({
    description: 'List of plant entity types',
    type: [InitPlantEntityTypes],
    example: [
      { tag: 'Moxa1210 PCC 2' },
      { tag: 'MV POWER METER' },
      { tag: 'AuxTrans' },
      { tag: 'SmartLogger' },
      { tag: 'HV1 POWER METER' },
      { tag: 'Online_Weather' },
      { tag: 'Irradiation' },
      { tag: 'Sub Temp' },
      { tag: 'Meter' },
      { tag: 'PV Temp' },
      { tag: 'Moxa1210 PCC 1' },
      { tag: 'Weather station' },
      { tag: 'Inverter' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitPlantEntityTypes)
  @UniqueCompositeFields(['tag'])
  data: InitPlantEntityTypes[];

  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;
}
