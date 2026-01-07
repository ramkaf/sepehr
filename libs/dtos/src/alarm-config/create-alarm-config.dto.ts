import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateAlarmConfigDto {
  @ApiProperty({
    description:
      'Tag must be lowercase and contain only letters, numbers, and colons',
    example: 'plant_alarm',
  })
  @IsString()
  @IsNotEmpty()
  tag: string;

  @ApiProperty({
    description: 'Title of the item',
    example: 'plant alarm',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '09519653-0b13-415c-8ce7-0142f46ae9a0',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;
}
