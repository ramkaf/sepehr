import { IUser } from './user.interface';
import { IEntityModel } from './entity.interface';
import { IEntityField } from './entity-field.interface';

export interface ICollectionEntity {
  id: number;

  collectionName: string | null;

  user: IUser;

  createdAt: Date | null;

  entity: IEntityModel;

  plantId: number;

  entityFields: IEntityField[];

  uuid: string;
}
