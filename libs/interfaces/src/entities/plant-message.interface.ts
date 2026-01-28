import { IAlarmCondition } from './alarm-condition.interface';
import { IEntityField } from './entity-field.interface';
import { PriorityLevelEnum } from 'libs/enums';

export interface IPlantMessage {
  psId: number;

  psText: string | null;

  psValue: number | null;
  psBitNo: number | null;

  entityField: IEntityField;

  level: PriorityLevelEnum | null;

  alarmId: number | null;

  alarmCondition: IAlarmCondition | null;

  uuid: string;
}
