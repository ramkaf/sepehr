import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  USER_MANAGEMENT_CREATE_PERMISSION,
  USER_MANAGEMENT_PERMISSION,
  USER_MANAGEMENT_READ_PERMISSION,
  USER_MANAGEMENT_TOGGLE_ACTIVE_PERMISSION,
  USER_MANAGEMENT_UPDATE_PASSWORD_PERMISSION,
  USER_MANAGEMENT_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { UserManagmentService } from '../provider/user-managment.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateOperationWithDocs,
  ApiGetOperationWithDocs,
  Auth,
} from '../../../document';
import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserAccessTypeDto,
  UpdateUserDto,
  UpdateUserOtpMethodDto,
  UuidDto,
} from 'libs/dtos';

@Auth()
@Controller('/admin/users-management')
@ApiTags('user-managment')
@ControllerPermission(USER_MANAGEMENT_PERMISSION)
export class UserManagementController {
  constructor(private readonly userManagmentService: UserManagmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresPermission(USER_MANAGEMENT_CREATE_PERMISSION)
  @ApiCreateOperationWithDocs('Create a new user')
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userManagmentService.createUser(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(USER_MANAGEMENT_READ_PERMISSION)
  @ApiGetOperationWithDocs('Get all users')
  async get() {
    return await this.userManagmentService.find();
  }

  @Patch('/update')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(USER_MANAGEMENT_UPDATE_PERMISSION)
  @ApiCreateOperationWithDocs('update user credentails')
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return await this.userManagmentService.update(updateUserDto);
  }

  @Patch('/update-password')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(USER_MANAGEMENT_UPDATE_PASSWORD_PERMISSION)
  @ApiCreateOperationWithDocs('change user password')
  @ApiBody({ type: ChangePasswordDto })
  async updateUserPassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.userManagmentService.modifyPassword(changePasswordDto);
  }

  @Patch('/toggle-active/:uuid')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(USER_MANAGEMENT_TOGGLE_ACTIVE_PERMISSION)
  @ApiCreateOperationWithDocs('toggle active / diactive user')
  async toggleUserActiveStatus(@Param() uuidDto: UuidDto) {
    return await this.userManagmentService.toggleActive(uuidDto);
  }

  @Patch('/update-otp-method')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(USER_MANAGEMENT_UPDATE_PERMISSION)
  @ApiCreateOperationWithDocs('update user otp method')
  @ApiBody({ type: UpdateUserOtpMethodDto })
  async updateOtpMethod(
    @Body() updateUserOtpMethodDto: UpdateUserOtpMethodDto,
  ) {
    return await this.userManagmentService.modifyUserOtpMethod(
      updateUserOtpMethodDto,
    );
  }

  @Patch('/update-access-type')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(USER_MANAGEMENT_UPDATE_PERMISSION)
  @ApiCreateOperationWithDocs('modify user access type')
  @ApiBody({ type: UpdateUserAccessTypeDto })
  async updateAccessType(
    @Body() updateUserAccessTypeDto: UpdateUserAccessTypeDto,
  ) {
    return await this.userManagmentService.modifyAccessTypeMethod(
      updateUserAccessTypeDto,
    );
  }
}
