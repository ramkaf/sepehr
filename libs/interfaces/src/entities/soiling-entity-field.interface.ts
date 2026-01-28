import { ISoiling } from './soiling.interface';
import { IEntityField } from './entity-field.interface';

export interface ISoilingEntityFields {
  id: number;

  soilingId: number;

  soiling: ISoiling;

  entityFieldId: number;

  entityField: IEntityField;

  uuid: string;
}
