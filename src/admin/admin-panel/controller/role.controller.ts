import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AssignPermissionsToRoleDto, CreateRoleDto, UuidDto } from 'libs/dtos';
import { RoleService } from '../../../rbac/services/role.service';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import {
  PERMISSION_PERMISSION,
  ROLE_CREATE_PERMISSION,
  ROLE_PERMISSION,
  ROLE_READ_PERMISSION,
  ROLE_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { PermissionService } from '../../../rbac/services/permission.service';

@Auth()
@Controller('roles')
@ApiTags('roles')
@ControllerPermission(ROLE_PERMISSION)
export class RoleController {
  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
  ) {}

  @Get('/permissions')
  @RequiresPermission(PERMISSION_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('read all existing permissions')
  findAllPermissions() {
    return this.permissionService.findAll();
  }
  @Get()
  @RequiresPermission(ROLE_READ_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('read all existing roles')
  findAll() {
    return this.roleService.findAllWithPermissions();
  }

  @Post()
  @RequiresPermission(ROLE_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create new Role')
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Get(':uuid')
  @RequiresPermission(ROLE_READ_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('get one Role')
  findOne(@Param() uuidDto: UuidDto) {
    return this.roleService.findWithPermissions(uuidDto);
  }

  @Patch()
  @RequiresPermission(ROLE_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('assign new or removing permission from one Role')
  assignPermissions(
    @Body() assignPermissionsToRoleDto: AssignPermissionsToRoleDto,
  ) {
    return this.roleService.assignPermissionsToRole(assignPermissionsToRoleDto);
  }
}
