import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class EntityFieldIdDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  efId: number;
}
