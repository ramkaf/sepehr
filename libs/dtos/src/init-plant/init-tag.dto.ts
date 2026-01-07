import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class InitPlantTagDto {
  @ApiProperty({
    example: 'koshk1',
    description: 'Elastic index name for the init plant',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  elasticIndex: string;

  @ApiProperty({
    example: 'koshk 1',
    description: 'Entity name related to the init plant',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  entityName: string;

  @ApiProperty({
    description: 'UUID of the province',
    example: 'a6232f52-793b-4848-b7ec-7842de60789f',
  })
  @IsUUID()
  @IsNotEmpty()
  provinceUuid: string;

  @ApiProperty({
    description: 'UUID of the plant Type',
    example: 'a6232f52-793b-4848-b7ec-7842de60789f',
  })
  @IsUUID()
  @IsNotEmpty()
  plantTypeUuid: string;

  @ApiProperty({
    description: 'UUID of the company',
    example: 'a6232f52-793b-4848-b7ec-7842de60789f',
  })
  @IsUUID()
  @IsNotEmpty()
  companyUuid: string;
}
