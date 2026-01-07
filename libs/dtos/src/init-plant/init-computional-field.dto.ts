import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { EntityTypeUuidDto, UuidDto } from '../generals-uuid';
import { IntersectionType } from '@nestjs/mapped-types';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';

export class InitComputationalParametersDto extends IntersectionType(
  UuidDto,
  EntityTypeUuidDto,
) {}

export class InitMultpleComputationalParametersDto {
  @ApiProperty({
    example: '09519653-0b13-415c-8ce7-0142f46ae9a0',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;

  @ApiProperty({
    description: 'List of plant computational parameter schema uuids',
    type: [InitComputationalParametersDto],
    example: [
      {
        uuid: 'a9b8a877-fb09-4809-8952-83fbfb8c537c',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '3cefcd9b-3ba7-4345-b8a8-ea35ffc4e474',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '928aaf5d-3372-4945-883b-339a7b403e5e',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: 'bb678116-e9f0-44e8-81dc-df8a398f460a',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '79682b3c-91dc-435e-bcc1-7dfaad947a34',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '7570160e-85e4-4a15-bda7-22bd1c19ad73',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '49c2971f-ff25-4971-9115-bec915cdf053',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '58052f2a-a89f-41bd-b894-a30161248d67',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '420eba16-8b6e-47bd-9000-a693bb047d85',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '728403a2-3d6d-4041-83de-c9e8516e5cd0',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '291a539a-148d-4d3e-b03e-e4eb5e15732a',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '2b75580a-da7d-4f55-ba80-78a05cd7a17c',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '7c69fe08-18aa-41fc-b399-6d798ba1126b',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '4ea1ca93-fad9-489e-8f5b-add80d38bd06',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
      {
        uuid: '713c0143-15ec-44bf-9f45-7e68974bf504',
        etUuid: '6ac6ec82-c2b7-42eb-8d7c-8c86f94a3dd7',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitComputationalParametersDto)
  @UniqueCompositeFields(['uuid'])
  data: InitComputationalParametersDto[];
}
