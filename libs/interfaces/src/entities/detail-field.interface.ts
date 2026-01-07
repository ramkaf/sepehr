import { IChartDetail } from './chart-detail.interface';
import { IEntityField } from './entity-field.interface';
import { ChartTypeEnum, OperationTypeEnum } from 'libs/enums';

export interface IDetailField {
  dfId: number;

  detailId: number;
  fieldId: number;

  unit: string | null;

  devideBy: number;

  oprType: OperationTypeEnum;

  chartType: ChartTypeEnum;

  chartDetail: IChartDetail;

  entityField: IEntityField;

  uuid: string;
}
