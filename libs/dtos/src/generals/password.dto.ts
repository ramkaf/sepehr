import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PasswordDto {
  @ApiProperty({
    example: 'Password123',
    description:
      'Password must be at least 8 characters long and contain at least one number.',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one number',
  })
  password: string;
}
