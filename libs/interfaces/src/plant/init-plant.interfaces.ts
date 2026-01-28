import { ICompany } from '../entities/company.interface';
import { IEntityFieldSchema } from '../entities/entity-field-schema.interface';
import { IEntityType } from '../entities/entity-type.interface';
import { IPlantType } from '../entities/plant-type.interface';
import { IProvince } from '../entities/province.interface';

export interface ISourceWithDevicesApiResult {
  sourceAndTheirDevices: ISourceWithDevices[];
  entityTypes: IEntityType[];
}

export interface ISourceWithDevices {
  sourceName: string;
  devices: string[];
}

export interface IEntityTypeWithParameters {
  entityType: IEntityType;
  paramters: string[];
}

export interface IGetParametersOfEntityTypesResponse {
  entityTypeWithParameters: IEntityTypeWithParameters[];
  entityTypes: IEntityTypeWithFieldSetupStatus[];
}

export interface IEntityTypeWithFieldSetupStatus extends IEntityType {
  areFieldsInitialized: boolean;
}

export interface IAllEntityTypesWithPlantTag extends IEntityType {
  plantUuid: string;
  plantTag: string;
}

export interface IPlantInitElasticIndexStatus {
  elasticIndex: string;
  isSetuped: boolean;
}
export interface IFirstStepCredentials {
  elasticIndexResults: IPlantInitElasticIndexStatus[];
  companies: ICompany[];
  plantTypes: IPlantType[];
  provinces: IProvince[];
}

export interface IGetComputationalFieldApiResult {
  computationalFields: IEntityFieldSchema[];
  entityTypes: IEntityType[];
  plantEntityType: IEntityType;
}
