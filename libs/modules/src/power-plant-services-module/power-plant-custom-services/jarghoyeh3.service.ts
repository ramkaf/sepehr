import { StringPlantService } from '../providers/plant/string-plant.service';
import {
  buildIrradianceAllValueQuery,
  buildIrradianceLastValueQuery,
  buildLatestDeviceFieldElasticQuery,
  ElasticService,
  EntityField,
  EntityModel,
} from 'libs/database';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  EntityFieldService,
  EntityService,
  PlantService,
  PlantStateService,
  PlantStatusService,
} from '../../insight';
import { CurveModelService } from '../providers/curve/curve.factory.service';
import { EntityFieldBaseService, SourceService } from '../../entity-management';
import { IResponseLastValue } from '../interfaces/base.service.interface';
import { MaskFunctionCoreService } from '../providers/mask-functions/mask-function-core.service';
import { setTimeRange } from 'libs/utils';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import { ICurve } from '../interfaces/curve.interface';
import { EnergyService } from './energy.service';
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { PlantDayLightService } from '../providers/day-light/day-light.service';
import { MaskFunctionsEnum } from 'libs/enums';

@Injectable()
export class Jarghoyeh3Service extends StringPlantService {
  protected static readonly PLANT_INDEX = 'jarghoyeh3-*';
  protected static readonly PLANT_TAG = 'jarghoyeh3';
  protected static readonly PLANT_ID = 944;
  private static readonly IRRADIATION_PARAMETER = 'Total_irradiance';
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
      Jarghoyeh3Service.PLANT_ID,
      Jarghoyeh3Service.PLANT_TAG,
      Jarghoyeh3Service.PLANT_INDEX,
      Jarghoyeh3Service.IRRADIATION_PARAMETER,
      Jarghoyeh3Service.POWER_FACTOR_PARAMETER,
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

  // override async irradiationLastValue(
  //   entity: EntityModel,
  // ): Promise<IResponseLastValue> {
  //   try {
  //     const irradiationDevicesName = ['Irradiation'];
  //     const elasticQuery = buildIrradianceLastValueQuery(
  //       irradiationDevicesName,
  //       Jarghoyeh3Service.IRRADIATION_PARAMETER,
  //     );
  //     const response = await this.elasticService.search(
  //       Jarghoyeh3Service.PLANT_INDEX,
  //       elasticQuery,
  //     );
  //     const { averageIrradiance: value, latestDateTime: Date } =
  //       this.processIrradiationData(
  //         response.aggregations.last_irradiance_per_device.buckets,
  //         Jarghoyeh3Service.IRRADIATION_PARAMETER,
  //       );
  //     if (!value || !Date) return this.lastValueServicesDefaultExport();
  //     return {
  //       value,
  //       Date,
  //     };
  //   } catch (error) {
  //     console.error(
  //       `error in ${Jarghoyeh3Service.PLANT_TAG}: irradiationLastValue service `,
  //       error,
  //     );
  //     return this.lastValueServicesDefaultExport();
  //   }
  // }
  // override async irradiationAllValues(
  //   entity: EntityModel,
  //   entityField: EntityField,
  //   dateDetails: IDateDetails,
  // ): Promise<ICurve> {
  //   try {
  //     const { range, date_histogram } = setTimeRange(dateDetails);
  //     const irradiationDevicesName = ['Irradiation'];
  //     const elasticQuery = buildIrradianceAllValueQuery(
  //       irradiationDevicesName,
  //       Jarghoyeh3Service.IRRADIATION_PARAMETER,
  //       range,
  //       date_histogram,
  //     );
  //     // return {elasticQuery}
  //     const response = await this.elasticService.search(
  //       Jarghoyeh3Service.PLANT_INDEX,
  //       elasticQuery,
  //     );
  //     const mappedResult: IMappedAllValueResult =
  //       response.aggregations.intervals.buckets.map((item: any) => {
  //         return {
  //           DateTime: item.key_as_string,
  //           value: item.irradiance.value ?? 0,
  //         };
  //       });
  //     return this.curveService.buildCurveWithOneValue(mappedResult);
  //   } catch (error) {
  //     console.error(
  //       `error in ${Jarghoyeh3Service.PLANT_TAG}: irradiationAllValues service `,
  //       error,
  //     );
  //     return this.allValueServicesDefaultExport();
  //   }
  // }

  override async modLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ): Promise<IResponseLastValue> {
    try {
      const body = {
        size: 1, // Get only the most recent document
        sort: [{ DateTime: { order: 'desc' } }],
        query: {
          bool: {
            must: [
              { term: { 'DeviceName.keyword': 'PV Temp' } },
              {
                range: {
                  DateTime: {
                    gte: 'now-5m', // Last 5 minutes
                    lte: 'now',
                  },
                },
              },
            ],
          },
        },
        _source: ['PV_temp', 'DateTime'], // Include only these fields
      };

      const response2 = await this.elasticService.search(
        Jarghoyeh3Service.PLANT_INDEX,
        body,
      );
      if (
        response2.hits &&
        response2.hits.hits &&
        response2.hits.hits.length > 0
      ) {
        const source = response2.hits.hits[0]._source;
        const Date = source.DateTime;
        const pvTemp = source.PV_temp;
        const maskedValue = this.maskFunctionService.mask(
          pvTemp,
          MaskFunctionsEnum.ToFixed1,
        ) as number;
        return {
          value: maskedValue,
          Date,
        };
      }
      return this.lastValueServicesDefaultExport();
    } catch (error) {
      console.error(
        `error in ${Jarghoyeh3Service.PLANT_TAG}: modLastValue service `,
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
                  'DeviceName.keyword': ['PV Temp'],
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
              avg_pv_temp: {
                avg: {
                  script: {
                    source:
                      "if (doc['DeviceName.keyword'].value == 'PV Temp') { if (doc['PV_temp'].size() >0) { return doc['PV_temp'].value; } } return null;",
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        Jarghoyeh3Service.PLANT_INDEX,
        body,
      );
      const mapped: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item) => {
          return {
            DateTime: item.key_as_string,
            value: item.avg_pv_temp?.value ?? 0,
          };
        });
      return this.curveService.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.ToFixed1,
      );
    } catch (error) {
      console.error(
        `error in ${Jarghoyeh3Service.PLANT_TAG}: modAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  override async modDailyAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    const should = await this.day_light_service.generateShouldClause(
      Jarghoyeh3Service.PLANT_TAG,
      dateDetails,
    );
    const { range, date_histogram } = setTimeRange(dateDetails);
    const body = {
      size: 0,
      query: {
        bool: {
          must: [{ range }, { term: { 'DeviceName.keyword': 'PV Temp' } }],
          should,
          minimum_should_match: 1,
        },
      },
      aggs: {
        mod: {
          date_histogram,
          aggs: {
            mod: {
              avg: {
                field: 'PV_temp',
              },
            },
          },
        },
      },
    };
    const response = await this.elasticService.search(
      Jarghoyeh3Service.PLANT_INDEX,
      body,
    );
    const mapped: IMappedAllValueResult = response.aggregations.mod.buckets.map(
      (item) => {
        const { value } = item.mod;
        return {
          DateTime: item.key_as_string,
          value,
        };
      },
    );
    return this.curveService.buildCurveWithOneValue(
      mapped,
      MaskFunctionsEnum.ToFixed1,
    );
  }
}
