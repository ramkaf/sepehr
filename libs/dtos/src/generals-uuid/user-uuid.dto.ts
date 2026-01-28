import { ApiProperty } from '@nestjs/swagger';
import { Matches, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UserUuidDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: '239a7f96-59f7-4fc7-bed5-c8c4a36595d6',
    description: 'UUID of the user',
  })
  @Matches(/^\S*$/, { message: 'key should not contain spaces' })
  userUuid: string;
}
