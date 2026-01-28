import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CompanyWarehouseIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of company warehouse',
  })
  @IsNotEmpty()
  @IsUUID()
  warehouse_id: string;
}

export class CompanyWarehouseIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of company warehouse',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  warehouse_id: string;
}
