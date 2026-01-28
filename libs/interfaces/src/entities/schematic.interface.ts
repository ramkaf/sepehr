import { IEntityModel } from './entity.interface';

export interface ISchematic {
  id: number;

  title: string | null;

  plantId?: number;

  plant?: IEntityModel | null;

  metadata: Record<string, any>;

  created_at: Date;
  updated_at: Date;

  uuid: string;
}
