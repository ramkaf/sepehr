import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class FieldTagDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S*$/, { message: 'field_tag must not contain spaces' })
  fieldTag: string;
}
