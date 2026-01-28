import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MediaIdOptionalDto } from '../../generals';

export class CreateSpecEntryDto extends MediaIdOptionalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  spec_key: string;

  @Expose()
  @Transform(({ obj }) => obj.spec_key)
  spec_title: string;
}
