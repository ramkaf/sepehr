import { IFleetManager } from './fleet-manager.interface';

export interface IProvince {
  pId: number;

  provinceName: string | null;
  provinceLat: number | null;
  provinceLong: number | null;

  fleetManagers: IFleetManager[];

  uuid: string;
}
