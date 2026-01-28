import { CompanyIdDto, ProvinceIdDto } from '@app/dtos/generals';
import { IntersectionType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyWareHouseDto extends IntersectionType(
  CompanyIdDto,
  ProvinceIdDto,
) {
  @ApiProperty({
    description: 'company warehouse name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'company warehouse tag',
  })
  @IsString()
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
