import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CompanyIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of company',
  })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;
}

export class CompanyIDOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of company',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  company_id: string;
}
