import { IEntityField } from './entity-field.interface';
import { BrowserGroupEnum } from 'libs/enums';

export interface IBrowserGroupEntity {
  id: number;

  name: BrowserGroupEnum;

  efId: number;
  entityField: IEntityField;

  uuid: string;
}
