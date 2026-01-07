import { Transform } from 'class-transformer';
import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class IdDTO {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  id: number;
}
