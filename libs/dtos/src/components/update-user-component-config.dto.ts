import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UuidDto } from '../generals-uuid';

export class UpdateUserComponentConfigDto extends UuidDto {
  @ApiProperty({
    description: 'The title of the component',
    example: 'Solar Panel A',
  })
  @IsNotEmpty()
  @IsString()
  componentTitle: string;

  @ApiProperty({
    description: 'The tag of the component',
    example: 'SP-A-001',
  })
  @IsNotEmpty()
  @IsString()
  componentTag: string;

  @ApiProperty({
    description: 'rows',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  rows?: number;

  @ApiProperty({
    description: 'cols',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  cols?: number;

  @ApiProperty({
    description: 'x',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  x?: number;

  @ApiProperty({
    description: 'y',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  y?: number;
}
