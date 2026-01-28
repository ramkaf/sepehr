import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';

export class CompanyUuidDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: '239a7f96-59f7-4fc7-bed5-c8c4a36595d6',
    description: 'UUID of the user',
  })
  companyUuid: string;
}
