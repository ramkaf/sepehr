import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GroupTypeEnum } from 'libs/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChartDetailDto {
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

  @ApiProperty({
    description: 'UUID of the charts',
    example: 'c93c96a5-d18a-4cf2-bcc6-57e17af8654',
  })
  @IsUUID()
  @IsNotEmpty()
  chUuid: string;

  @ApiProperty({
    description: 'UUID of the Entity Type',
    example: '7db557ca-5b44-46f0-ae2f-05a922f9d1a0',
  })
  @IsUUID()
  @IsOptional()
  etUuid?: string;
}
