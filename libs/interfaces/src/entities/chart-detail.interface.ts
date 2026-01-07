import { GroupTypeEnum } from 'libs/enums';
import { IDetailField } from './detail-field.interface';
import { IChartEntity } from './chart-entity.interface';
import { IEntityType } from './entity-type.interface';
import { IChart } from './chart.interface';

export interface IChartDetail {
  detailId: number;

  detailTitle: string | null;
  detailDes: string | null;

  groupType: GroupTypeEnum;

  chartId: number;

  etId: number | null;

  chart: IChart;

  entityType: IEntityType | null;

  detailsFields: IDetailField[];

  chartEntities: IChartEntity[];

  uuid: string;
}
