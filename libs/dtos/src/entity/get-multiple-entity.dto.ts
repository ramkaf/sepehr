import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { EntityIdDto } from '../generals/entity-id.dto';

export class GetMultipleEntityByIdDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntityIdDto)
  data: EntityIdDto[];
}
