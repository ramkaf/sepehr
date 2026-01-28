import {
  CompanyIdDto,
  CompanyIDOptionalDto,
  ProvinceIdDto,
  ProvinceIdOptionalDto,
} from '@app/dtos/generals';
import { UuidDto } from '@app/dtos/generals-uuid';
import { CompanyWarehouseIdDto } from '@app/dtos/generals/warehouse-id.dto';
import { IntersectionType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCompanyWareHouseDto extends IntersectionType(
  CompanyIDOptionalDto,
  ProvinceIdOptionalDto,
) {
  @ApiProperty({
    description: 'company warehouse name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'company warehouse tag',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'company warehouse address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'country',
    required: false,
    example: 'Iran',
  })
  @IsOptional()
  @IsString()
  country?: string;
}
