import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchematicCategoryDto {
  @ApiProperty({
    example: 'Inverter',
    description: 'title of schematics',
  })
  @IsString()
  title: string;
}
