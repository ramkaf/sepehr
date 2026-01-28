import { IEntityField } from './entity-field.interface';
import { IEntityType } from './entity-type.interface';
import { IEntityModel } from './entity.interface';
import { ISoilingEntities } from './soiling-entities.interface';
import { ISoilingEntityFields } from './soiling-entity-field.interface';
import { IUser } from './user.interface';

export interface ISoiling {
  id: number;

  title: string | null;

  baseEntity: IEntityModel;

  plant: IEntityModel;

  user: IUser;

  entityType: IEntityType;

  baseStringVoltage: IEntityField;

  baseStringCurrent: IEntityField;

  soilingEntityFields: ISoilingEntityFields[];

  soilingEntities: ISoilingEntities[];

  uuid: string;
}
