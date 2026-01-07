import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class EntityIdDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  eId: number;
}
