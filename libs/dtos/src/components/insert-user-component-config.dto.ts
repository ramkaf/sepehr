import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UserUuidDto } from '../generals-uuid/user-uuid.dto';
import { PlantUuidDto } from '../generals-uuid';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InsertUserComponentConfigDto extends IntersectionType(
  UserUuidDto,
  PlantUuidDto,
) {
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
