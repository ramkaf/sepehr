import { IEntityType } from './entity-type.interface';

export interface IEntityData {
  uuid: string;
  entityName: string;
  entityTag: string;
  entityType: IEntityType;
}
