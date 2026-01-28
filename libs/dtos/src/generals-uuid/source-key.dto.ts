import { Matches, IsNotEmpty, IsString } from 'class-validator';

export class SourceKeyDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S*$/, { message: 'key should not contain spaces' })
  key: string;
}
