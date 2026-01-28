import { IEntityType } from './entity-type.interface';

export interface IEntityTypeFieldSetupStatus {
  etId: number;

  isFieldsInitiated: boolean;

  entityType: IEntityType;
}
