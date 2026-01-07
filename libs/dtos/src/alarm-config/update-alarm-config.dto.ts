import { IsNotEmpty, IsString } from 'class-validator';
import { UuidDto } from '../generals-uuid';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlarmConfigDto extends UuidDto {
  @ApiProperty({
    description: 'Title of the item',
    example: 'My Title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
