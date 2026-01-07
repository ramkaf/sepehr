import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Unique role name.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Administrator role with full permissions',
    description: 'Description of the role.',
  })
  @IsString()
  description: string;
}

export class AssignPermissionsToRoleDto {
  @ApiProperty({
    example: 'b6c1c15a-7d56-4d0a-bb5f-35f2d041b4e5',
    description: 'UUID of the role to assign permissions to.',
  })
  @IsUUID()
  @IsNotEmpty()
  roleUuid: string;

  @ApiProperty({
    example: [
      'b6c1c15a-7d56-4d0a-bb5f-35f2d041b4e5',
      'e3b0c442-98fc-1c14-9afb-d4c1b7e5f1e4',
    ],
    description: 'List of permission UUIDs to assign to the role.',
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  permissionUuids: string[];
}
