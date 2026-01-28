import { IEntityField } from './entity-field.interface';
import { IEntityModel } from './entity.interface';

export interface IPlantFieldVisibility {
  efId: number;
  plantId: number;

  isEnabled: boolean;

  entityField: IEntityField;

  plant: IEntityModel;
}
