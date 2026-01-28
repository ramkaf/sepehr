import { IEntityModel } from './entity.interface';

export interface ISource {
  id: number;

  key: string;

  sourceName: string;

  plantId: number;

  plant: IEntityModel;

  uuid: string;
}
