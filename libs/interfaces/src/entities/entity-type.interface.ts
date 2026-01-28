import { AbstractionLevelEnum } from 'libs/enums';
import { IEntityField } from './entity-field.interface';

export interface IEntityType {
  etId: number;
  name: string;
  tag: string;
  description: string | null;
  abstractionLevel: AbstractionLevelEnum;
  uuid: string;
  plantId?: number;
  entityFields?: IEntityField[];
}
