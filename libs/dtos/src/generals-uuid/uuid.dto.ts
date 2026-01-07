import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class UuidDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID v4 format',
    format: 'uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  uuid: string;
}
