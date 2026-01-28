import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class MaintenanceStepIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of step',
  })
  @IsNotEmpty()
  @IsUUID()
  ms_id: string;
}

export class MaintenanceStepIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of step',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ms_id?: string;
}
