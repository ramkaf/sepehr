import { AbstractionLevelEnum, PlantSetupEnum } from 'libs/enums';
import { IEntityType } from '../entities/entity-type.interface';
import { ISource } from '../entities/source.interface';
import { IEntityField } from '../entities/entity-field.interface';

export interface IEntityTypeReport {
  etId: number;
  name: string;
  tag: string;
  description: string | null;
  abstractionLevel: AbstractionLevelEnum;
  uuid: string;
  initializedDeviceCount: number;
  initializedParameterCount: number;
  computationalFieldCount: number;
  staticFieldCount: number;
  areFieldsInitialized: boolean;
}

export interface IPlant {
  uuid: string;
  entityName: string | null;
  entityTag: string;
  entityType: IEntityType;
}

export interface IPlantSetupReport {
  plant: IPlant;
  sources: ISource[];
  setupStep: PlantSetupEnum;
  totalInitializedDeviceCount: number;
  totalInitializedParameterCount: number;
  totalInitializedEntityTypeCount: number;
  totalEntityTypesWithInitializedParameters: number;
  totalEntityTypesWithUninitializedParameters: number;
  totalComputationalFieldsCount: number;
  totalStaticFieldsCount: number;
  entityTypeReports: IEntityTypeReport[];
}

export interface IPlantEntityTypeParameterReport {
  etId: number;
  tag: string;
  name: string;
  uuid: string;
  plantId: string;
  abstractionLevel: AbstractionLevelEnum;
  entityFields: IEntityField[];
  elasticParameters: string[];
}

// export interface IEntityType {
//   etId: number;
//   tag: string;
//   name: string;
//   uuid: string;
//   plantId?: number;
//   abstractionLevel: AbstractionLevelEnum;
//   entityFields: EntityField[];
//   description?: string | null;
// }

export interface IPlantDeviceEntityTypesWithParameters {
  etId: number;
  tag: string;
  name: string;
  uuid: string;
  plantId?: number;
  abstractionLevel: AbstractionLevelEnum;
  entityFields: IEntityField[];
  description?: string | null;
}

export interface IPlantDeviceParametersFromElasticAndPostgres extends IPlantDeviceEntityTypesWithParameters {
  elasticParameters: string[];
}

export interface IEntityTypeParameterWithStatus {
  fieldTag: string;
  isInitializedInElastic: boolean;
  isInitializedInPostgres: boolean;
}

export interface IPlantEntityTypeParametersInitiatedInElasticAndPostgresStatus {
  etId: number;
  tag: string;
  name: string;
  uuid: string;
  plantId?: number;
  abstractionLevel: AbstractionLevelEnum;
  description?: string;
  parameterWithStatus: {
    fieldTag: string;
    isInitializedInElastic: boolean;
    isInitializedInPostgres: boolean;
  }[];
  entityTypeInitializedParametersInElasticStatus: boolean;
  entityTypeInitializedParametersInPostgresStatus: boolean;
}
