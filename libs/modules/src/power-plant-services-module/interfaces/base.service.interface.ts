import { IEntityField } from 'libs/interfaces';
import { SantralPlantService } from '../providers/plant/santral-plant.service';
import { StringPlantService } from '../providers/plant/string-plant.service';

export interface PlantServiceMap {
  [key: string]: new (
    ...args: any[]
  ) => StringPlantService | SantralPlantService;
}

export interface IResponseLastValue {
  Date: string | number;
  value: number;
}

export interface IResponseStringsLastValue {
  Date: string | number;
  value: string | number;
}

export interface IBrowserLastValueResponse extends IEntityField {
  Date: string;
  value: number | string;
}
