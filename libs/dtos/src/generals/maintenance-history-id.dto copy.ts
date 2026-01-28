import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class MaintenanceHistoryIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of history',
  })
  @IsNotEmpty()
  @IsUUID()
  mh_id: string;
}

export class MaintenanceHistoryIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of history',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  mh_id?: string;
}
