import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateUpdateSourceDto {
  @IsNotEmpty()
  @IsString()
  sourceName: string;

  @IsString()
  @Matches(/^\S*$/, { message: 'key should not contain spaces' })
  @IsNotEmpty()
  key: string;
}
