import { IPermission } from './permission.interface';

export interface IRole {
  id: number;
  name: string;
  description: string;
  permissions: IPermission[];
}
