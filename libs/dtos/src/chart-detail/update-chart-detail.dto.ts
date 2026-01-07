import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { GroupTypeEnum } from 'libs/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChartDetailDto {
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
    example: 'plant data',
    description: 'The title of the detail',
  })
  @IsNotEmpty()
  @IsString()
  detailTitle: string;

  @ApiProperty({
    example: 'plant data',
    description: 'The description of the detail',
  })
  @IsNotEmpty()
  @IsString()
  detailDes: string;

  @ApiProperty({
    example: GroupTypeEnum.PER_DEVICE,
    enum: GroupTypeEnum,
    description: 'The group type for this detail',
  })
  @IsNotEmpty()
  @IsEnum(GroupTypeEnum)
  groupType: GroupTypeEnum;
}
