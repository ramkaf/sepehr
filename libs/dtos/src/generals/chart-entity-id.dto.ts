import { Transform } from 'class-transformer';
import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class ChartEntityIdDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  cheId: number;
}
