import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SpecIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of spec',
  })
  @IsNotEmpty()
  @IsUUID()
  spec_id: string;
}

export class SpecIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of device spec',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  spec_id?: string;
}
