import { IChartDetail } from './chart-detail.interface';
import { IEntityModel } from './entity.interface';

export interface IChartEntity {
  cheId: number;

  detailId: number;
  entityId: number;

  chartEntityTitle: string | null;

  chartDetail: IChartDetail;

  entity: IEntityModel;

  uuid: string;
}
