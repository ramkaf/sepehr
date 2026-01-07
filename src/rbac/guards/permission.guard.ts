import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  CONTROLLER_PERMISSION_KEY,
} from '../decorators/requires-permission.decorator';
import { IPermission } from '../interfaces/permission.interface';
import { RoleService } from '../services/role.service';
import { UserService } from '../../user/providers/user.service';
import { RedisService, Role } from 'libs/database';
import { REDIS_INDEX_ROLE } from 'libs/constants';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const controllerPermission = this.reflector.get<string>(
      CONTROLLER_PERMISSION_KEY,
      context.getClass(),
    );

    const result = await this.hasPermission(
      context,
      controllerPermission,
      requiredPermissions,
    );
    return result;
  }

  async getUserPermissions(context): Promise<IPermission[]> {
    const { user } = context.switchToHttp().getRequest();
    let roleWithPermissions;
    const permissionsJsonString = await this.redisService.get(REDIS_INDEX_ROLE);
    if (permissionsJsonString)
      roleWithPermissions = JSON.parse(permissionsJsonString);
    else {
      roleWithPermissions = await this.roleService.findAllWithPermissions();
      await this.redisService.set(
        REDIS_INDEX_ROLE,
        JSON.stringify(roleWithPermissions),
      );
    }
    const users = await this.userService.findAllWithRoles();
    const userObj = users.find((item) => item.uuid === user.id);
    if (!userObj) throw new BadRequestException('user not found');
    const userPermissions = roleWithPermissions.find(
      (item: Role) => item.uuid === userObj.role.uuid,
    ).permissions;
    return userPermissions;
  }
  async hasPermission(context, controllerPermission, requiredPermissions) {
    if (!requiredPermissions && !controllerPermission) return true;
    const userPermissions = await this.getUserPermissions(context);
    if (userPermissions.length === 0) return false;
    const cp = this.checkControllerPermissionAccessability(
      userPermissions,
      controllerPermission,
    );
    const rp = this.checkRequiredPermissionAccessability(
      userPermissions,
      requiredPermissions,
    );
    return cp || rp;
  }
  private checkRequiredPermissionAccessability(
    userPermissions,
    requiredPermissions,
  ): boolean {
    if (!requiredPermissions || userPermissions.length === 0) return true;
    return requiredPermissions.every((permission) =>
      userPermissions.some((userPerm) => userPerm.name === permission),
    );
  }
  private checkControllerPermissionAccessability(
    userPermissions,
    controllerPermission,
  ): boolean {
    if (!controllerPermission) return false;
    const hasControllerPermission = userPermissions.some(
      (permission) => permission.name === `${controllerPermission}:*`,
    );
    if (hasControllerPermission) return true;
    return false;
  }
}
