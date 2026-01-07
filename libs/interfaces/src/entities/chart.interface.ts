import { IEntityModel } from './entity.interface';
import { IChartDetail } from './chart-detail.interface';
import { TimeGroupTypeEnum } from 'libs/enums';
import { IUserChart } from './user-chart.interface';

export interface IChart {
  chartId: number;

  plantId: number;

  plant: IEntityModel;

  chartTitle: string | null;
  chartDes: string | null;

  timeGroup: number;

  timeGroupType: TimeGroupTypeEnum | null;

  userCharts: IUserChart[];

  chartDetails: IChartDetail[];

  uuid: string;
}
