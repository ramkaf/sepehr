import { IProvince } from './province.interface';
import { IFleetManager } from './fleet-manager.interface';

export interface ICompany {
  uuid: string;

  companyId: number;

  companyCode: string | null;
  companyTag: string;

  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  country?: string;

  provinceId?: number;
  province?: IProvince | null;

  fleetManagers: IFleetManager[];

  createdAt: Date;
  updatedAt: Date;
}
