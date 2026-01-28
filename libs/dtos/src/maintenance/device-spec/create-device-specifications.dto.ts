import { IsNotEmpty, IsString } from 'class-validator';
import { SpecIdDto } from '../../generals';

export class CreateDeviceSpecDto extends SpecIdDto {
  @IsString()
  @IsNotEmpty()
  spec_value: string;
}
