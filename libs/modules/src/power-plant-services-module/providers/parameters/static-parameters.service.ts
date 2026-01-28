import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityFieldService } from '../../../insight';
import { EntityField } from 'libs/database';
import { IEntityField } from 'libs/interfaces';
import { IBrowserLastValueResponse } from '../../interfaces/base.service.interface';

@Injectable()
export class StaticParameterService {
  constructor(private readonly entityFieldService: EntityFieldService) {}
  async fetchStaticParameterValue(efUuid: string) {
    const parameters = await this.fetchAllStaticParametersWithValues(efUuid);
    const parameter = parameters.find((obj) => obj.uuid === efUuid);
    if (!parameter)
      throw new BadRequestException(
        `the provided efUuid: ${efUuid} doesnt blong to any static parameter`,
      );
    return parameter.value;
  }
  async fetchAllStaticParametersWithValues(plantUuid: string) {
    const result =
      await this.entityFieldService.fetchStaticParameters(plantUuid);
    return result.map((item: EntityField) => {
      return { ...item, value: item.staticValue };
    });
  }
  async mapStaticParametersToLastValue(
    parameters: IEntityField[],
  ): Promise<IBrowserLastValueResponse[]> {
    return parameters.map((item) => {
      return {
        ...item,
        value: item.staticValue ? item.staticValue : NaN,
        Date: new Date().toDateString(),
      };
    });
  }
}
