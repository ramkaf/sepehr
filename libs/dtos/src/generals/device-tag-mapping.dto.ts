import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class DeviceTagMappingIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of tag mapping',
  })
  @IsNotEmpty()
  @IsUUID()
  dtm_id: string;
}

export class DeviceTagMappingIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of tag mapping',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  dtm_id?: string;
}
