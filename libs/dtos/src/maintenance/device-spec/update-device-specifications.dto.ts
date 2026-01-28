import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDeviceSpecDto {
  @IsString()
  @IsOptional()
  spec_value?: string;
}
