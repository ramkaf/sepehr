import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SourceKeyDto {
  @IsString()
  @Matches(/^\S*$/, { message: 'key should not contain spaces' })
  @IsNotEmpty()
  key: string;
}
