import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserAccessTypeDto,
  UpdateUserDto,
  UpdateUserOtpMethodDto,
  UuidDto,
} from 'libs/dtos';
import { RoleService } from '../../../rbac/services/role.service';
import { UserService } from '../../../user/providers/user.service';
import { PasswordService } from '../../../user/providers/password.service';
import { PermissionService } from '../../../rbac/services/permission.service';
import { ERROR_MESSAGES } from 'libs/constants';
import { UserGlobalService } from 'libs/modules';
import { Permission, Role } from 'libs/database';

@Injectable()
export class UserManagmentService {
  constructor(
    private readonly userGlobalService: UserGlobalService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    await this.userService.reIndexUsersIntoRedis();
    return user;
  }

  async find() {
    return await this.userGlobalService.findWithRoleAndPermission();
  }

  async update(updateUserDto: UpdateUserDto) {
    const { uuid, ...rest } = updateUserDto;
    const user = await this.userGlobalService.update(uuid, rest);
    await this.userService.reIndexUsersIntoRedis();
    return user;
  }

  async modifyPassword(changePasswordDto: ChangePasswordDto) {
    const { uuid, password } = changePasswordDto;
    const user = await this.userGlobalService.findOne(uuid);
    if (!user)
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND(uuid));
    await this.passwordService.changePassword(user, password);
    return true;
  }

  async toggleActive(uuidDto: UuidDto) {
    return await this.userService.toggleActiveUser(uuidDto);
  }

  async findRoles(): Promise<Role[]> {
    return await this.roleService.findAllWithPermissions();
  }

  async findPermissions(): Promise<Permission[]> {
    return await this.permissionService.findAll();
  }

  async modifyUserOtpMethod(updateUserOtpMethodDto: UpdateUserOtpMethodDto) {
    const { uuid, otpMethod } = updateUserOtpMethodDto;
    const user = await this.userService.modifyOtpMethod(uuid, otpMethod);
    await this.userService.reIndexUsersIntoRedis();
    return user;
  }
  async modifyAccessTypeMethod(
    updateUserAccessTypeDto: UpdateUserAccessTypeDto,
  ) {
    const { uuid, accessType } = updateUserAccessTypeDto;
    const user = await this.userService.modifyAccessType(uuid, accessType);
    await this.userService.reIndexUsersIntoRedis();
    return user;
  }
}
