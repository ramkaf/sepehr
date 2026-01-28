import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class MediaIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of media',
  })
  @IsNotEmpty()
  @IsUUID()
  media_id: string;
}

export class MediaIdOptionalDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of media',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  media_id?: string;
}
