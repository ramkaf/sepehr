import { IEntityField } from './entity-field.interface';
import {
  EntityFieldPeriodFunctionEnum,
  EntityFieldConditionOperatorEnum,
} from 'libs/enums';

export interface IEntityFieldCondition {
  id: number;

  entityField: IEntityField;
  dependentField: IEntityField;

  value: number;
  condition: EntityFieldConditionOperatorEnum;
  efcFunction: EntityFieldPeriodFunctionEnum;

  uuid: string;
}
