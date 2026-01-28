import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyWarehouseUuidDto {
  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the warehouse devices',
  })
  @IsUUID()
  @IsNotEmpty()
  companyWarehouseUuid: string;
}
