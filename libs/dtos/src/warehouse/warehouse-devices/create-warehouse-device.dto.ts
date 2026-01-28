import { CompanyWarehouseUuidDto } from '@app/dtos/generals-uuid/company-warehouse-uuid.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWareHouseDeviceDto extends CompanyWarehouseUuidDto {
  @ApiProperty({
    description: 'company warehouse name',
  })
  @IsNotEmpty()
  @IsString()
  serialNumber: string;

  @ApiProperty({
    description: 'company warehouse tag',
  })
  @IsString()
  @IsOptional()
  productNumber?: string;

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
  displayName?: string;
}
