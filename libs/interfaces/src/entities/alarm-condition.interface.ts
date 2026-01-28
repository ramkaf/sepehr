import { IEntityModel } from './entity.interface';
import { IPlantMessage } from './plant-message.interface';

export interface IAlarmCondition {
  id: number;

  serviceName: string | null;

  plant_id: number;
  plantId: IEntityModel | null;

  userCharts: IPlantMessage[];

  uuid: string;
}
