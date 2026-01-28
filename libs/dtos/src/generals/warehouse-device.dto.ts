import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WarehouseDeviceIdDto {
  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the warehouse devices',
  })
  @IsUUID()
  @IsNotEmpty()
  device_id: string;
}

export class WarehouseDeviceOptionalIdDto {
  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the warehouse devices',
  })
  @IsUUID()
  @IsOptional()
  device_id?: string;
}
