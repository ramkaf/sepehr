import { StringPlantService } from '../providers/plant/string-plant.service';
import {
  buildQomPowerPlantModQuery,
  ElasticService,
  EntityField,
  EntityModel,
} from 'libs/database';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CurveModelService } from '../providers/curve/curve.factory.service';
import { EntityFieldBaseService, SourceService } from '../../entity-management';
import { IResponseLastValue } from '../interfaces/base.service.interface';
import { EnergyService } from './energy.service';
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { MaskFunctionsEnum } from 'libs/enums';
import {
  EntityFieldService,
  EntityService,
  ICurve,
  PlantService,
  PlantStateService,
  PlantStatusService,
} from 'libs/modules';
import { PlantDayLightService } from '../providers/day-light/day-light.service';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import { getFormattedDateTime, setTimeRange } from 'libs/utils';
@Injectable()
export class QomService extends StringPlantService {
  private static readonly PLANT_INDEX = 'qom-*';
  private static readonly PLANT_TAG = 'qom';
  private static readonly PLANT_ID = 220;
  private static readonly IRRADIATION_PARAMETER =
    'Irradiance_(temperature_compensated_signal)';
  private static readonly POWER_FACTOR_PARAMETER = 'PF_total_(unsigned)';

  constructor(
    elasticService: ElasticService,
    maskFunctionService: MaskFunctionService,
    sourceService: SourceService,
    private readonly entityFieldBaseService: EntityFieldBaseService,
    plantService: PlantService,
    curveModelService: CurveModelService,
    entityFieldService: EntityFieldService,
    entityService: EntityService,
    statusService: PlantStatusService,
    stateService: PlantStateService,
    energyService: EnergyService,
    dayLightService: PlantDayLightService,
  ) {
    super(
      QomService.PLANT_ID,
      QomService.PLANT_TAG,
      QomService.PLANT_INDEX,
      QomService.IRRADIATION_PARAMETER,
      QomService.POWER_FACTOR_PARAMETER,
      elasticService,
      plantService,
      curveModelService,
      entityFieldService,
      entityService,
      statusService,
      sourceService,
      maskFunctionService,
      stateService,
      energyService,
      dayLightService,
    );
  }
  override async modLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ): Promise<IResponseLastValue> {
    try {
      const elasticQuery = buildQomPowerPlantModQuery();
      const response = await this.elasticService.search(
        QomService.PLANT_INDEX,
        elasticQuery,
      );
      const moxa1 = response.aggregations.devices.buckets.find(
        (b: any) => b.key == 'Moxa1242 SUB 1',
      ).last_values.hits.hits[0]._source;
      const moxa3 = response.aggregations.devices.buckets.find(
        (b: any) => b.key == 'Moxa1242 SUB 3',
      ).last_values.hits.hits[0]._source;
      const pvModuleTemperature =
        (moxa1.AI0Scaling + moxa1.AI1Scaling + moxa3.AI0Scaling) / 3;
      // const masked = this.maskFunctionCoreService.NumberStringToNFixedNumber(
      //   this.maskFunctionCoreService.scaleMOD(pvModuleTemperature)
      // );
      const maskedValue = this.maskFunctionService.mask(pvModuleTemperature, [
        MaskFunctionsEnum.scaleMOD,
        MaskFunctionsEnum.ToFixed1,
      ]) as number;
      return {
        value: maskedValue,
        Date: moxa1.DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${QomService.PLANT_TAG}: modLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  override async modAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': ['Moxa1242 SUB 1', 'Moxa1242 SUB 3'],
                },
              },
              {
                range,
              },
            ],
          },
        },
        aggs: {
          intervals: {
            date_histogram,
            aggs: {
              avg_AI0Scaling_moxa1: {
                avg: {
                  script: {
                    source: `
                if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 1'
                    && doc['AI0Scaling'].size() > 0
                    && doc['AI0Scaling'].value != 4
                    && doc['AI0Scaling'].value != 20) {
                  return doc['AI0Scaling'].value;
                }
                return null;
              `,
                  },
                },
              },

              avg_AI1Scaling_moxa1: {
                avg: {
                  script: {
                    source: `
                if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 1'
                    && doc['AI1Scaling'].size() > 0
                    && doc['AI1Scaling'].value != 4
                    && doc['AI1Scaling'].value != 20) {
                  return doc['AI1Scaling'].value;
                }
                return null;
              `,
                  },
                },
              },

              avg_AI0Scaling_moxa3: {
                avg: {
                  script: {
                    source: `
                if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 3'
                    && doc['AI0Scaling'].size() > 0
                    && doc['AI0Scaling'].value != 4
                    && doc['AI0Scaling'].value != 20) {
                  return doc['AI0Scaling'].value;
                }
                return null;
              `,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elastic_Service.search(
        QomService.PLANT_INDEX,
        body,
      );

      const mapped: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item) => {
          const data = [
            item.avg_AI0Scaling_moxa3.value,
            item.avg_AI0Scaling_moxa1.value,
            item.avg_AI1Scaling_moxa1.value,
          ].filter((obj) => obj !== null);
          const mod = data.reduce((sum, v) => sum + v, 0) / data.length;
          return {
            DateTime: item.key_as_string,
            value: mod,
          };
        });
      return this.curveService.buildCurveWithOneValue(mapped, [
        MaskFunctionsEnum.scaleMOD,
        MaskFunctionsEnum.ToFixed1,
      ]);
    } catch (error) {
      console.error(`error in ${this.plant_Tag}: modAllValues service `, error);
      return this.allValueServicesDefaultExport();
    }
  }
  override async modDailyAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    try {
      const should = this.dayLightService.generateShouldClause(
        QomService.PLANT_TAG,
        dateDetails,
      );
      const { range, date_histogram } = setTimeRange(dateDetails);

      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': ['Moxa1242 SUB 1', 'Moxa1242 SUB 3'],
                },
              },
              {
                range,
              },
            ],
            should,
            minimum_should_match: 1,
          },
        },
        aggs: {
          intervals: {
            date_histogram,
            aggs: {
              avg_AI0Scaling_moxa1: {
                avg: {
                  script: {
                    source: `
                  if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 1'
                      && doc['AI0Scaling'].size() > 0
                      && doc['AI0Scaling'].value != 4
                      && doc['AI0Scaling'].value != 20) {
                    return doc['AI0Scaling'].value;
                  }
                  return null;
                `,
                  },
                },
              },
              avg_AI1Scaling_moxa1: {
                avg: {
                  script: {
                    source: `
                  if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 1'
                      && doc['AI1Scaling'].size() > 0
                      && doc['AI1Scaling'].value != 4
                      && doc['AI1Scaling'].value != 20) {
                    return doc['AI1Scaling'].value;
                  }
                  return null;
                `,
                  },
                },
              },
              avg_AI0Scaling_moxa3: {
                avg: {
                  script: {
                    source: `
                  if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 3'
                      && doc['AI0Scaling'].size() > 0
                      && doc['AI0Scaling'].value != 4
                      && doc['AI0Scaling'].value != 20) {
                    return doc['AI0Scaling'].value;
                  }
                  return null;
                `,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        QomService.PLANT_INDEX,
        body,
      );
      const mapped: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item) => {
          const data = [
            item.avg_AI0Scaling_moxa3.value,
            item.avg_AI0Scaling_moxa1.value,
            item.avg_AI1Scaling_moxa1.value,
          ].filter((obj) => obj !== null);
          const mod = data.reduce((sum, v) => sum + v, 0) / data.length;
          return {
            DateTime: item.key_as_string,
            value: mod,
          };
        });
      return this.curveService.buildCurveWithOneValue(mapped, [
        MaskFunctionsEnum.scaleMOD,
        MaskFunctionsEnum.ToFixed1,
      ]);
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag}: modDailyAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async substationModLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ): Promise<IResponseLastValue> {
    try {
      const { entityTag } = entity;
      const { fieldTag } = entityField;
      const mappingModParameter = [
        {
          fieldTag: 'mod[indic:0]',
          parameter: 'AI0Scaling',
        },
        {
          fieldTag: 'mod[indic:1]',
          parameter: 'AI1Scaling',
        },
      ];
      const [_, __, device] = entityTag.split(':');
      const mappedObj = mappingModParameter.find(
        (item) => item.fieldTag === fieldTag,
      );
      if (!mappedObj) return this.lastValueServicesDefaultExport();
      const { parameter } = mappedObj;
      const body = {
        size: 0,
        query: {
          bool: {
            should: [{ term: { 'DeviceName.keyword': device } }],
          },
        },
        aggs: {
          last_values: {
            top_hits: {
              _source: [parameter, 'DateTime'],
              sort: [
                {
                  DateTime: {
                    order: 'desc',
                  },
                },
              ],
              size: 1,
            },
          },
        },
      };
      const response = await this.elasticService.search(
        QomService.PLANT_INDEX,
        body,
      );
      const mod =
        response.aggregations.last_values.hits.hits[0]._source[parameter];
      if (!mod || mod === undefined || mod === 4 || mod === 20)
        return this.lastValueServicesDefaultExport();
      const maskedValue = this.maskFunctionService.mask(mod, [
        MaskFunctionsEnum.scaleMOD,
        MaskFunctionsEnum.ToFixed1,
      ]) as number;
      return {
        value: maskedValue,
        Date: getFormattedDateTime(),
      };
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag} services-substationModLastValue:`,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async substationModAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    try {
      const { entityTag } = entity;
      const { fieldTag } = entityField;
      const { range, date_histogram } = setTimeRange(dateDetails);
      const mappingModParameter = [
        {
          fieldTag: 'mod[indic:0]',
          parameter: 'AI0Scaling',
        },
        {
          fieldTag: 'mod[indic:1]',
          parameter: 'AI1Scaling',
        },
      ];
      const [_, __, device] = entityTag.split(':');
      const mappedObj = mappingModParameter.find(
        (item) => item.fieldTag === fieldTag,
      );
      if (!mappedObj) return this.allValueServicesDefaultExport();
      const { parameter } = mappedObj;
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                term: {
                  'DeviceName.keyword': device,
                },
              },
              {
                range,
              },
            ],
          },
        },
        aggs: {
          intervals: {
            date_histogram,
            aggs: {
              avg_moxa: {
                avg: {
                  script: {
                    source: `
                  if (doc['AI0Scaling'].size() > 0
                      && doc['AI0Scaling'].value != 4
                      && doc['AI0Scaling'].value != 20) {
                    return doc['AI0Scaling'].value;
                  }
                  return null;
                `,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        QomService.PLANT_INDEX,
        body,
      );

      const mapped: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item) => {
          const mod = item.avg_moxa.value;
          return {
            value: mod,
            Date: item.key_as_string,
          };
        });
      return this.curveService.buildCurveWithOneValue(mapped, [
        MaskFunctionsEnum.scaleMOD,
        MaskFunctionsEnum.ToFixed1,
      ]);
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag} services-substationModAllValues:`,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
}
