import { ValidateNested, IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUpdateSourceDto } from './create-update-source.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateMultipleSourceDto {
  @ApiProperty({
    example: [
      { sourceName: 'PCC', key: 'ModbusClientData' },
      { sourceName: 'Substation 4', key: 'DESKTOP-LFORCE4' },
      { sourceName: 'Substation 3', key: 'DESKTOP-LFORCE3' },
      { sourceName: 'Substation 2', key: 'DESKTOP-LFORCE2' },
      { sourceName: 'Substation 1', key: 'DESKTOP-LFORCE1' },
    ],
    description: 'List of sources to create or update',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUpdateSourceDto)
  data: CreateUpdateSourceDto[];

  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the plant',
  })
  @IsNotEmpty()
  @IsUUID()
  plantUuid: string;
}
