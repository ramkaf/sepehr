import { EntityFieldTypeEnum, MaskFunctionsEnum } from 'libs/enums';
import { IAlarmConfig } from './alarm-config.interface';
import { IEntityType } from './entity-type.interface';
import { IEntityFieldsPeriod } from './entity-field-period.interface';
import { IAlertConfigMessage } from './alert-config-message.interface';
import { IBookmarkField } from './bookmark.interface';
import { IEntityFieldCondition } from './entity-field-condition.interface';
import { ISoiling } from './soiling.interface';
import { IDetailField } from './detail-field.interface';
import { ICollectionEntity } from './collection.interface';
import { IBrowserGroupEntity } from './browser-group.interface';
import { IPlantMessage } from './plant-message.interface';
import { ISoilingEntityFields } from './soiling-entity-field.interface';

export interface IEntityField {
  efId: number;

  fieldTitle: string;
  fieldTag: string;

  unit: string | null;

  isComputational: boolean;

  lastValueFunctionName: string | null;
  allValuesFunctionName: string | null;

  isStatic: boolean;

  staticValue: string;

  browserGroupOld: string;

  description: string | null;

  maskFunction: MaskFunctionsEnum | null;

  fieldType: EntityFieldTypeEnum;

  defaultCacheValue: string | null;

  etId: number;

  acId: number | null;
  alarmConfig: IAlarmConfig | null;

  entityType: IEntityType;

  fieldsPeriod: IEntityFieldsPeriod | null;

  alertConfigMessages: IAlertConfigMessage[];

  bookmarkFields: IBookmarkField[];

  conditions: IEntityFieldCondition[];
  dependentConditions: IEntityFieldCondition[];

  soilingBaseVoltages: ISoiling[];
  soilingBaseCurrents: ISoiling[];

  detailsFields: IDetailField[];

  collections: ICollectionEntity[];

  browserGroup: IBrowserGroupEntity[];

  plantmessages: IPlantMessage[];

  soilingEntityFields: ISoilingEntityFields[];

  nestLastValueFunctionName: string | null;
  nestAllValuesFunctionName: string | null;

  uuid: string;
}
