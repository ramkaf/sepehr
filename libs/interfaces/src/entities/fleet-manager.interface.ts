import { PlantSetupEnum } from 'libs/enums';
import { IProvince } from './province.interface';
import { ICompany } from './company.interface';
import { IEntityModel } from './entity.interface';
import { IPlantType } from './plant-type.interface';

export interface IFleetManager {
  id: number;

  service: string | null;

  plant: IEntityModel | null;
  plantId: number | null;

  setupStep: PlantSetupEnum;

  uuid: string;

  setupStartedAt: Date;

  province: IProvince | null;

  plantType: IPlantType | null;

  company: ICompany | null;
}
