import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const CONTROLLER_PERMISSION_KEY = 'controller_permission';

export const RequiresPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const ControllerPermission = (resource: string) =>
  SetMetadata(CONTROLLER_PERMISSION_KEY, resource);
