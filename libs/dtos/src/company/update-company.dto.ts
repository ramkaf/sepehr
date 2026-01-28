import {
  IsNotEmpty,
  isNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UuidDto } from '../generals-uuid';

export class UpdateCompanyDto {
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
