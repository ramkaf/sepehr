import { IRole } from './role.interface';

export interface IPermission {
  id: number;

  name: string;

  description: string;

  category: string | null;

  roles: IRole[];

  uuid: string;
}
