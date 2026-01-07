import { Injectable } from '@nestjs/common';
import { PlantServiceFactory } from '../plant/power-plant-service.factory';
import { IEntityField } from 'libs/interfaces';
import { EntityModel } from 'libs/database';
import { IBrowserLastValueResponse } from '../../interfaces/base.service.interface';
import { MaskFunctionService } from '../mask-functions/mask-function.service';

@Injectable()
export class ComputationalParameterService {
  constructor(
    private readonly plantServiceFactory: PlantServiceFactory,
    private readonly maskFunctionService: MaskFunctionService,
  ) {}

  async fetchAllEntityComputationalParameterLastValue(
    plant: EntityModel,
    entity: EntityModel,
    parameters: IEntityField[],
  ): Promise<IBrowserLastValueResponse[]> {
    const computationalFields = parameters.filter(
      (item) => !item.fieldTag.includes('weather'),
    );
    const weatherFields = parameters.filter((item) =>
      item.fieldTag.includes('weather'),
    );
    const computationalFieldsWithLastValue =
      await this.fetchEntityComputationalParameterWithLastValue(
        plant,
        entity,
        computationalFields,
      );
    const weatherFieldsWithLastValue =
      await this.fetchEntityWeatherParameterWithLastValue(plant, weatherFields);
    return [...weatherFieldsWithLastValue, ...computationalFieldsWithLastValue];
  }
  async fetchEntityComputationalParameterWithLastValue(
    plant: EntityModel,
    entity: EntityModel,
    parameters: IEntityField[],
  ): Promise<IBrowserLastValueResponse[]> {
    const result: any[] = [];
    for (const obj of parameters) {
      if (obj.lastValueFunctionName) {
        const { Date, value } = await this.plantServiceFactory.invokeMethod(
          plant.entityTag,
          obj.lastValueFunctionName,
          entity,
        );
        result.push({
          ...obj,
          Date,
          value: value ? value : NaN,
        });
      }
    }
    return result;
  }
  async fetchEntityWeatherParameterWithLastValue(
    plant: EntityModel,
    parameters: IEntityField[],
  ): Promise<IBrowserLastValueResponse[]> {
    const weatherObj = await this.plantServiceFactory.invokeMethod(
      plant.entityTag,
      'weatherLastValue',
      parameters,
    );
    return parameters.map((item: IEntityField) => {
      return {
        ...item,
        value: weatherObj[item.fieldTag.replace('weather_', '')]
          ? weatherObj[item.fieldTag.replace('weather_', '')]
          : NaN,
        Date: weatherObj['DateTime'],
      };
    });
  }
}
