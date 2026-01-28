import { IEntityModel } from './entity.interface';

export interface IAlarmConfig {
  id: number;

  title: string | null;
  tag: string | null;

  plantId: number;
  plant: IEntityModel;

  entityFields: IAlarmConfig[];

  uuid: string;
}
