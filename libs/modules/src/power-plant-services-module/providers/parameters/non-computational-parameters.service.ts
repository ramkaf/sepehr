import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService, PlantService } from '../../../insight';
import { EntityBaseService, SourceService } from '../../../entity-management';
import {
  buildDeviceNonComputationalParametersLastValueQuery,
  buildNonComputationalParameterElasticQuery,
  ElasticService,
  EntityModel,
} from 'libs/database';
import { IEntityField } from 'libs/interfaces';
import { generatePlantIndex } from 'libs/utils';
import { IBrowserLastValueResponse } from '../../interfaces/base.service.interface';
@Injectable()
export class NonComputationalService {
  constructor(
    private readonly entityService: EntityService,
    private readonly sourceService: SourceService,
    private readonly entityBaseService: EntityBaseService,
    private readonly plantService: PlantService,
    private readonly elasticService: ElasticService,
  ) {}
  async fetchDeviceNonComputationalParametersWithPeriodLastValue(
    eUuid: string,
    userUuid: string,
  ) {
    const entity = await this.entityBaseService.findOne(eUuid);
    if (!entity)
      throw new BadRequestException(`entity with uuid :${eUuid} not found`);
    const plant = await this.entityService.getEntityPlant(eUuid);
    const parameters =
      await this.entityService.fetchDeviceParametersWithPeriodAndBookmark(
        eUuid,
        userUuid,
      );
    const plantIndex = await this.plantService.getPlantElasticSearchIndex(
      plant.uuid,
    );
    const [_, substation, device] = entity.entityTag.split(':');
    const logFilePathPrefix = await this.sourceService.mapSub(
      plant.uuid,
      substation,
    );
    const elasticQuery = buildDeviceNonComputationalParametersLastValueQuery(
      device,
      logFilePathPrefix,
    );
    // return elasticQuery
    const result = await this.elasticService.search(plantIndex, elasticQuery);

    return { parameters, result };
    // const nonComputationalParameters = parameters.filter ( item => item.is_computational === false && item.is_static === false)
    // const nonComputationalParameters =
    // let result = []
    //  for (const obj of weatherParameters) {
    //   result.push({
    //     ...obj,
    //     Date:weatherObj.DateTime,
    //     value : weatherObj? weatherObj[obj.fieldTag.replace('weather_' , '')] : NaN,
    //   });
    // }
  }

  public async fetchNonComputationalParamWithPeriodLastValue(
    plant: EntityModel,
    entityTag: string,
    parameters: IEntityField[],
  ): Promise<IBrowserLastValueResponse[]> {
    const [plantTag, substation, device] = entityTag.split(':');
    const plantDataDelay = await this.plantService.fetchPlantDataDelay(
      plant.uuid,
    );
    const sourceKey = await this.sourceService.mapSub(plant.uuid, substation);
    const plantIndex = generatePlantIndex(plantTag);
    const elasticQuery = buildNonComputationalParameterElasticQuery(
      parameters,
      device,
      sourceKey,
      plantDataDelay,
    );
    const rawElasticResult = await this.elasticService.search(
      plantIndex,
      elasticQuery,
    );
    const result = this.simplifyElasticResponseDynamic(rawElasticResult);
    if (!result) return [];
    const DateTime = result['DateTime'] as string;
    return parameters.map((item) => {
      const { fieldTag } = item;
      const value = result[fieldTag];
      return {
        ...item,
        value: value ? value : null,
        Date: DateTime,
      };
    });
  }
  private simplifyElasticResponseDynamic(data: any) {
    const result: Record<string, any> = {};
    const lastHit =
      data?.aggregations?.last_value?.top_hits?.hits?.hits?.[0]?._source;
    if (!lastHit) return null;

    Object.assign(result, lastHit);

    for (const [aggKey, aggVal] of Object.entries(data.aggregations || {})) {
      if (aggKey === 'last_value') continue;

      // const innerValue = aggVal?.[aggKey]?.value;
      const innerValue = (aggVal as { [key: string]: { value?: number } })?.[
        aggKey
      ]?.value;
      if (innerValue !== undefined) {
        result[aggKey] = innerValue;
      }
    }

    return result;
  }
}
