import { IEntityField } from './entity-field.interface';

export interface IAlertConfigMessage {
  id: number;

  efId: number;
  entityField: IEntityField;

  condition: string | null;
  value: number | null;
  message: string | null;
  severity: string | null;

  uuid: string;
}
