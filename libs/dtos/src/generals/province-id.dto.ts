import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ProvinceIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of province',
  })
  @IsNotEmpty()
  @IsUUID()
  province_id: string;
}

export class ProvinceIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of province',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  province_id?: string;
}
