import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { EntityTypeUuidDto } from '../generals-uuid';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntityDto extends EntityTypeUuidDto {
  @ApiProperty({
    description: 'The name of the entity',
    example: 'Solar Panel A',
  })
  @IsNotEmpty()
  @IsString()
  entityName: string;

  @ApiProperty({
    description: 'The unique tag of the entity',
    example: 'SP-A-001',
  })
  @IsNotEmpty()
  @IsString()
  entityTag: string;

  @ApiProperty({
    description: 'The parent entity ID in the hierarchy',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @IsPositive()
  parentInTreeId: number;
}
