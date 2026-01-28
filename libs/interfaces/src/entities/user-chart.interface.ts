import { IChart } from './chart.interface';
import { IUser } from './user.interface';

export interface IUserChart {
  uchId: number;

  userId: number;
  chartId: number;

  user: IUser;
  chart: IChart;

  x: number | null;
  y: number | null;
  cols: number | null;
  rows: number | null;

  uuid: string;
}
