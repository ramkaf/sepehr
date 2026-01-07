import { ISoiling } from './soiling.interface';
import { IEntityModel } from './entity.interface';

export interface ISoilingEntities {
  id: number;

  soilingId: number;

  soiling: ISoiling;

  entityId: number;

  entity: IEntityModel;

  uuid: string;
}
