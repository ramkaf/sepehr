import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsUUID,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID v4 format',
    format: 'uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  uuid: string;

  @ApiProperty({
    example: 'Password123',
    description:
      'Password must be at least 8 characters long and contain at least one number.',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
