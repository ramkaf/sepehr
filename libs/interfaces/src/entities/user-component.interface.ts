import { IUser } from './user.interface';
import { IEntityModel } from './entity.interface';

export interface IUserComponentsConfig {
  uccId: number;

  userId: number;
  user: IUser;

  componentTag: string | null;

  x: number | null;
  y: number | null;
  rows: number | null;
  cols: number | null;

  componentTitle: string | null;

  plant_id: number;
  plantId: IEntityModel | null;

  uuid: string;
}
