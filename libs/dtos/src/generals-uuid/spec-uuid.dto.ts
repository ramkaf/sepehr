import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { UniqueCompositeFields } from '../generals/unique-composite-fields.validator.ts';

export class SpecUuid {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  specUuid: string;
}

export class MultipleSpecUuidDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'specUuid array must contain at least 1 item' })
  @ValidateNested({ each: true })
  @Type(() => SpecUuid)
  @UniqueCompositeFields(['specUuid'])
  @IsNotEmpty()
  specUuids: SpecUuid[];
}
