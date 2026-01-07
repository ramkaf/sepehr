import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEntityDto {
  @ApiProperty({
    description: 'UUID of the entity',
    example: 'f1a243b9-bc10-4e2b-9137-842fa5e6fbb3',
  })
  @IsNotEmpty()
  @IsString()
  uuid: string;

  @ApiProperty({
    description: 'The new name of the entity',
    example: 'Updated Solar Panel A',
  })
  @IsNotEmpty()
  @IsString()
  entityName: string;

  @ApiProperty({
    description: 'The new parent entity ID in the hierarchy',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  parentInTreeId: number;
}
