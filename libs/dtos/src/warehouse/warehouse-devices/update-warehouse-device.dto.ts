import { WarehouseDeviceUuidDto } from '@app/dtos/generals-uuid';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateWareHouseDeviceDto {
  @ApiProperty({
    description: 'company warehouse name',
  })
  @IsOptional()
  @IsString()
  serial_number: string;

  @ApiProperty({
    description: 'company warehouse tag',
  })
  @IsString()
  @IsOptional()
  product_number?: string;

  @ApiProperty({
    description: 'company warehouse address',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    description: 'country',
    required: false,
    example: 'Iran',
  })
  @IsOptional()
  @IsString()
  display_name?: string;
}
