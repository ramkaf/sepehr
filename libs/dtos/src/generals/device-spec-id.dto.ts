import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class DeviceSpecIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of device spec',
  })
  @IsNotEmpty()
  @IsUUID()
  ds_id: string;
}

export class DeviceSpecIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of device spec',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ds_id?: string;
}
