import { IsUUID, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UuidDto } from '../generals-uuid';

export class UpdateSchematicCategoryDto extends UuidDto {
  @ApiProperty({
    example: 'Inverter',
    description: 'title of schematics',
  })
  @IsString()
  title: string;
}
