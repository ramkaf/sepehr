import { StringPlantService } from '../providers/plant/string-plant.service';
import {
  buildMehrizPowerPlantModQuery,
  ElasticService,
  EntityField,
  EntityModel,
} from 'libs/database';
import { Injectable } from '@nestjs/common';
import {
  EntityFieldService,
  EntityService,
  PlantService,
  PlantStateService,
  PlantStatusService,
} from '../../insight';
import { CurveModelService } from '../providers/curve/curve.factory.service';
import { EntityFieldBaseService, SourceService } from '../../entity-management';
import { EnergyService } from './energy.service';
import { IResponseLastValue } from '../interfaces/base.service.interface';
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { MaskFunctionsEnum } from 'libs/enums';
import { PlantDayLightService } from '../providers/day-light/day-light.service';
import { getFormattedDateTime, setTimeRange } from 'libs/utils';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import { ICurve } from '../interfaces/curve.interface';
@Injectable()
export class MehrizService extends StringPlantService {
  private static readonly PLANT_INDEX = 'mehriz-*';
  private static readonly PLANT_TAG = 'mehriz';
  private static readonly PLANT_ID = 692;
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
      MehrizService.PLANT_ID,
      MehrizService.PLANT_TAG,
      MehrizService.PLANT_INDEX,
      MehrizService.IRRADIATION_PARAMETER,
      MehrizService.POWER_FACTOR_PARAMETER,
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
      const elasticQuery = buildMehrizPowerPlantModQuery();
      const result = await this.elasticService.search(
        MehrizService.PLANT_INDEX,
        elasticQuery,
      );
      const moxa3 = result.aggregations.devices.buckets.find(
        (b: any) => b.key == 'Moxa1242 SUB 3',
      ).last_values.hits.hits[0]._source;
      const moxa4 = result.aggregations.devices.buckets.find(
        (b: any) => b.key == 'Moxa1242 SUB 4',
      ).last_values.hits.hits[0]._source;
      const pvModuleTemperature = (moxa3.AI0Scaling + moxa4.AI0Scaling) / 2;
      const DateTime = moxa3.DateTime;
      const maskedValue = this.maskFunctionService.mask(pvModuleTemperature, [
        MaskFunctionsEnum.ScaleMehrizMod,
        MaskFunctionsEnum.ToFixed1,
      ]) as number;
      return {
        value: maskedValue,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${MehrizService.PLANT_TAG}: modLastValue service `,
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
                  'DeviceName.keyword': [
                    'Moxa1242 SUB 1',
                    'Moxa1242 SUB 3',
                    'Moxa1242 SUB 4',
                  ],
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
              avg_AI0Scaling_moxa4: {
                avg: {
                  script: {
                    source: `
          if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 4' 
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
        MehrizService.PLANT_INDEX,
        body,
      );
      const mapped = response.aggregations.intervals.buckets.map((item) => {
        const data = [
          item.avg_AI0Scaling_moxa3.value,
          item.avg_AI0Scaling_moxa4.value,
          item.avg_AI0Scaling_moxa1.value,
        ].filter((obj) => obj !== null);
        const mod = (data.reduce((sum, v) => sum + v, 0) / data.length).toFixed(
          1,
        );
        return {
          DateTime: item.key_as_string,
          value: mod,
        };
      });
      return this.curveService.buildCurveWithOneValue(mapped, [
        MaskFunctionsEnum.ScaleMehrizMod,
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
      const should = await this.dayLightService.generateShouldClause(
        MehrizService.PLANT_TAG,
        dateDetails,
      );
      const { range, date_histogram } = setTimeRange(dateDetails);
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              { range },
              {
                terms: {
                  'DeviceName.keyword': [
                    'Moxa1242 SUB 1',
                    'Moxa1242 SUB 3',
                    'Moxa1242 SUB 4',
                  ],
                },
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
              avg_AI0Scaling_moxa4: {
                avg: {
                  script: {
                    source: `
          if (doc['DeviceName.keyword'].value == 'Moxa1242 SUB 4' 
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
        MehrizService.PLANT_TAG,
        body,
      );
      const mapped: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item) => {
          const data = [
            item.avg_AI0Scaling_moxa3.value,
            item.avg_AI0Scaling_moxa4.value,
            item.avg_AI0Scaling_moxa1.value,
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
      const [_, __, device] = entityTag.split(':');
      const body = {
        size: 0,
        query: {
          bool: {
            must: [{ term: { 'DeviceName.keyword': device } }],
          },
        },
        aggs: {
          last_values: {
            top_hits: {
              _source: ['AI0Scaling'],
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
      const response2 = await this.elasticService.search(
        MehrizService.PLANT_INDEX,
        body,
      );
      const mod =
        response2.aggregations.last_values.hits.hits[0]._source['AI0Scaling'];

      if (mod === undefined || !mod || mod === 20 || mod === 4)
        return this.lastValueServicesDefaultExport();
      const masked = this.maskFunctionService.mask(mod, [
        MaskFunctionsEnum.ToFixed1,
        MaskFunctionsEnum.scaleMOD,
      ]) as number;
      return {
        value: masked,
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
  ) {
    try {
      const { entityTag } = entity;
      const [_, __, device] = entityTag.split(':');
      const { range, date_histogram } = setTimeRange(dateDetails);
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
        MehrizService.PLANT_INDEX,
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
      return this.maskFunctionService.mask(mapped, MaskFunctionsEnum.scaleMOD);
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag} services : substationModAllValues `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
}
