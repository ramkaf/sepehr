import { AccessTypeEnum } from 'libs/enums';
import { IUser } from './user.interface';

export interface IAccessType {
  id: number;

  access: AccessTypeEnum;

  users: IUser[];

  uuid: string;
}
