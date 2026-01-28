import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { UuidDto } from '../generals-uuid';
import { IntersectionType } from '@nestjs/mapped-types';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';

export class InitStaticParametersDto extends IntersectionType(UuidDto) {
  @IsString()
  staticValue: string | null;
}

export class InitMultpleStaticParametersDto {
  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;

  @ApiProperty({
    description:
      'List of plant static parameter uuids with their entitytype id with static value',
    type: [InitStaticParametersDto],
    example: [
      {
        uuid: '4786fc45-288d-43ac-a6ad-79409e039c86',
        staticValue: '',
      },
      {
        uuid: 'be263f71-5c93-409e-947d-ce2662cda008',
        staticValue: '',
      },
      {
        uuid: 'b770746f-ceef-4de2-b51f-576669d056d7',
        staticValue: 'a',
      },
      {
        uuid: '1c3cf36f-bb43-42c4-9dc4-6b29e2ef9816',
        staticValue: '',
      },
      {
        uuid: '617cf096-70c9-48b3-b80d-fdc6da2b11d1',
        staticValue: '+03:30',
      },
      {
        uuid: 'e9ee635c-6b34-45d0-87be-fb65b1f60abb',
        staticValue: '',
      },
      {
        uuid: '8c57c2fe-cdaa-4c2b-a58f-47811444b1db',
        staticValue: '',
      },
      {
        uuid: '3263433b-fc79-4397-b885-405d1c107e0a',
        staticValue: '',
      },
      {
        uuid: 'c869ea72-fbb5-4c34-9fe8-ba60f82024e2',
        staticValue: '',
      },
      {
        uuid: '1ec0e1af-ea3a-45f6-a991-ce168d5c4049',
        staticValue: '',
      },
      {
        uuid: 'b1f2a2c5-8d25-4702-827c-a89fa99cabe8',
        staticValue: '',
      },
      {
        uuid: 'bb93a1bb-2668-4ae7-873c-9ee7c77f34f0',
        staticValue: '',
      },
      {
        uuid: '2175674a-75b2-4cad-8764-ce037234de6c',
        staticValue: '',
      },
      {
        uuid: 'b2aa6f32-f797-4213-9c7f-5db7c5d29f1d',
        staticValue: '',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitStaticParametersDto)
  @UniqueCompositeFields(['uuid'])
  data: InitStaticParametersDto[];
}
