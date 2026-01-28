import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { UniqueCompositeFields } from '../generals';
import { ApiProperty } from '@nestjs/swagger';
import { UuidDto } from '../generals-uuid';
import { InsertUserComponentConfigDto } from './insert-user-component-config.dto';

export class InsertMultipleUserComponentConfigDto {
  @ApiProperty({
    type: [UuidDto],
    description: 'Array of uuid to delete',
    example: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsertUserComponentConfigDto)
  @UniqueCompositeFields(['componentTag'])
  data: InsertUserComponentConfigDto[];
}
