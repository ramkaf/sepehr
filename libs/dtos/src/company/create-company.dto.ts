import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'company name',
  })
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @ApiProperty({
    description: 'company tag',
  })
  @IsNotEmpty()
  @IsString()
  company_tag: string;

  @ApiProperty({
    description: 'company code',
    required: false,
  })
  @IsOptional()
  @IsString()
  company_code?: string;

  @ApiProperty({
    description: 'description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'contact email',
    required: false,
  })
  @IsOptional()
  @IsString()
  contact_email?: string;

  @ApiProperty({
    description: 'contact phone',
    required: false,
  })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiProperty({
    description: 'website',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: 'country',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'province Uuid',
    required: false,
  })
  @IsUUID()
  province_id?: string;
}
