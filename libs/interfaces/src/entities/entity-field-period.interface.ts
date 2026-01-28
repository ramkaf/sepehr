import { IEntityField } from './entity-field.interface';
import { EntityFieldPeriodFunctionEnum, RangeTypeEnum } from 'libs/enums';

export interface IEntityFieldsPeriod {
  id: number;

  functionName: EntityFieldPeriodFunctionEnum;

  entityField: IEntityField;
  efId: number;

  rangeValue: number;
  rangeType: RangeTypeEnum;

  uuid: string;
}
