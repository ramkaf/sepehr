import { IsUUID, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEntityTypeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the entity type to update',
  })
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty({
    example: 'Temperature Sensor',
    description: 'New name for the entity type',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Entity type used for monitoring temperature',
    description: 'Detailed description of the entity type',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
