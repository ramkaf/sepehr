import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class ChartIdDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  chartId: number;
}
