import { IFleetManager } from './fleet-manager.interface';

export interface IPlantType {
  ptId: number;

  plantTypeTitle: string | null;
  plantTypeName: string | null;

  fleetManagers: IFleetManager[];

  uuid: string;
}
