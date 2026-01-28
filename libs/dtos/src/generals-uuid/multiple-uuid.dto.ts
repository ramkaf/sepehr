import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { UuidDto } from './uuid.dto';
import { ApiProperty } from '@nestjs/swagger';

export class MultipleUuidDto {
  @ApiProperty({
    type: [UuidDto],
    description: 'Array of UUID objects',
    example: [{ uuid: 'dfe4627c-90ff-4bb8-8981-c0b85e0da3ad' }],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UuidDto)
  data: UuidDto[];
}
