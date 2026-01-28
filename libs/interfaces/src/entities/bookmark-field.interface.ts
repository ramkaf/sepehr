import { IUser } from './user.interface';
import { IEntityField } from './entity-field.interface';

export interface IBookmarkField {
  id: number;

  userId: number;
  user: IUser;

  efId: number;
  entityField: IEntityField;

  createdAt: Date;

  uuid: string;
}
