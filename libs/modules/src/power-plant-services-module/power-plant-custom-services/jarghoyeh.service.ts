import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  buildJarghoyeh2Co2AllValueQuery,
  buildJarghoyeh2TreeLastValueQuery,
  buildLatestDeviceFieldElasticQuery,
  buildSubCo2ReductionStringPowerPlantQuery,
  ElasticService,
  EntityField,
  EntityModel,
} from 'libs/database';
import { StringPlantService } from '../providers/plant/string-plant.service';
import { IResponseLastValue } from '../interfaces/base.service.interface';
import { EntityFieldBaseService, SourceService } from '../../entity-management';
import {
  EntityFieldService,
  EntityService,
  PlantService,
  PlantStateService,
  PlantStatusService,
} from '../../insight';
import { CurveModelService } from '../providers/curve/curve.factory.service';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import { setTimeRange } from 'libs/utils';
import { MaskFunctionsEnum, PlantStatusEnum } from 'libs/enums';
import { ICurve } from '../interfaces/curve.interface';
import { EnergyService } from './energy.service';
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { PlantDayLightService } from '../providers/day-light/day-light.service';
import { DateTime } from 'luxon';

@Injectable()
export class JarghoyehService extends StringPlantService {
  private static readonly PLANT_INDEX = 'jarghoyeh-*';
  private static readonly PLANT_TAG = 'jarghoyeh';
  private static readonly PLANT_ID = 1;
  private static readonly IRRADIATION_PARAMETER = 'Total_irradiance';
  private static readonly POWER_FACTOR_PARAMETER = 'PF_total_';

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
      JarghoyehService.PLANT_ID,
      JarghoyehService.PLANT_TAG,
      JarghoyehService.PLANT_INDEX,
      JarghoyehService.IRRADIATION_PARAMETER,
      JarghoyehService.POWER_FACTOR_PARAMETER,
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

  override async powerFactorLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    try {
      const lastPowerFactorHV1Query = buildLatestDeviceFieldElasticQuery(
        'HV1 POWER METER OUT 1',
        'PF_total_',
      );
      const lastPowerFactorHV1 = await this.elasticService.search(
        JarghoyehService.PLANT_INDEX,
        lastPowerFactorHV1Query,
      );
      const lastPowerFactorHV2Query = buildLatestDeviceFieldElasticQuery(
        'HV1 POWER METER OUT 2',
        'PF_total_(unsigned)',
      );
      const lastPowerFactorHV2 = await this.elasticService.search(
        JarghoyehService.PLANT_INDEX,
        lastPowerFactorHV2Query,
      );

      const dateTime = lastPowerFactorHV1.hits.hits[0]._source.DateTime;

      const power_factor =
        (this.maskFunctionService.mask(
          lastPowerFactorHV2.hits.hits[0]._source['PF_total_(unsigned)'],
          MaskFunctionsEnum.Absolute,
        ) as number) +
        (this.maskFunctionService.mask(
          lastPowerFactorHV1.hits.hits[0]._source['PF_total_'],
          MaskFunctionsEnum.Absolute,
        ) as number);
      return {
        value: power_factor,
        Date: dateTime,
      };
    } catch (error) {
      console.error(
        `error in ${JarghoyehService.PLANT_TAG}: powerFactorLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  // override async isolationTodayLastValue(
  //   entity: EntityModel,
  // ): Promise<IResponseLastValue> {
  //   try {
  //     const elasticQuery = buildLatestDeviceFieldElasticQuery(
  //       'Irradiation',
  //       'Daily_irradiation_amount',
  //     );
  //     const result = await this.elasticService.search(
  //       JarghoyehService.PLANT_INDEX,
  //       elasticQuery,
  //     );
  //     const value =
  //       result.hits?.hits?.[0]?._source?.['Daily_irradiation_amount'];
  //     const DateTime = result.hits?.hits?.[0]?._source?.['DateTime'];
  //     if (value === undefined) return this.lastValueServicesDefaultExport();
  //     return {
  //       value,
  //       Date: DateTime,
  //     };
  //   } catch (error) {
  //     console.error(
  //       `error in ${JarghoyehService.PLANT_TAG}: isolationTodayLastValue service `,
  //       error,
  //     );
  //     return this.lastValueServicesDefaultExport();
  //   }
  // }
  override async modLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    try {
      const elasticQuery = buildLatestDeviceFieldElasticQuery('PV Temp', [
        'PV_module_temperature',
        'PV_temp',
      ]);
      const response = await this.elasticService.search(
        this.plant_Index,
        elasticQuery,
      );
      const PVTemp1 = response.hits.hits[0]._source['PV_module_temperature'];
      const PVTemp2 = response.hits.hits[0]._source['PV_temp'];
      const value: number = PVTemp1 ?? PVTemp2 ?? NaN;
      const maskedValue = this.maskFunctionService.mask(
        value,
        MaskFunctionsEnum.ToFixed1,
      ) as number;
      return {
        value: maskedValue,
        Date: response.hits.hits[0]._source['DateTime'],
      };
    } catch (error) {
      console.error(`error in ${this.plant_Tag}: modLastValue service `, error);
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
                      "if (doc['DeviceName.keyword'].value == 'PV Temp') { if (doc['PV_module_temperature'].size() >0) { return doc['PV_module_temperature'].value; } } return null;",
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plant_Index, body);
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
        JarghoyehService.PLANT_TAG,
        dateDetails,
      );
      const { range, date_histogram } = setTimeRange(dateDetails);
      const body = {
        size: 0,
        query: {
          bool: {
            must: [{ range }, { term: { 'DeviceName.keyword': `PV Temp` } }],
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
                  field: 'PV_module_temperature',
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        JarghoyehService.PLANT_INDEX,
        body,
      );
      const mapped: IMappedAllValueResult =
        response.aggregations.mod.buckets.map((item: any) => {
          const { value } = item.mod;
          return {
            DateTime: item.key_as_string,
            value,
          };
        });
      return this.curveService.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.ToFixed1,
      );
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag}: modDailyAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  override async fetchAmbientTemperature() {
    try {
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'Weather station',
        'Ambient_temperature',
      );
      const result = await this.elasticService.search(
        JarghoyehService.PLANT_INDEX,
        elasticQuery,
      );
      const value = result.hits.hits[0]._source['Ambient_temperature'];
      return value ? value : NaN;
    } catch (error) {
      console.error(
        `error in ${JarghoyehService.PLANT_TAG}: fetchAmbientTempature service `,
        error,
      );
      return NaN;
    }
  }
  async co2ReductionLastValue(entity: EntityModel) {
    try {
      const co2InSub1 = await this.getSubCo2Reduction('WS-04');
      const co2InSub2 = await this.getSubCo2Reduction('WS-01');
      const co2InSub3 = await this.getSubCo2Reduction('WS-03');
      const co2InSub4 = await this.getSubCo2Reduction('WS-02');
      // return { co2InSub1, co2InSub2, co2InSub3, co2InSub4 };
      return this.lastValueServicesDefaultExport();
      return {
        value:
          co2InSub1.CO2_reduction +
          co2InSub2.CO2_reduction +
          co2InSub3.CO2_reduction +
          co2InSub4.CO2_reduction,
        Date: co2InSub4.DateTime,
      };
    } catch (error) {
      return this.lastValueServicesDefaultExport();
    }
  }
  private async getSubCo2Reduction(sub: string) {
    const elasticQuery = buildSubCo2ReductionStringPowerPlantQuery(
      'CO2_reduction',
      'SmartLogger',
      sub,
    );
    return elasticQuery;
    const result = await this.elasticService.search(
      JarghoyehService.PLANT_INDEX,
      elasticQuery,
    );
    return result.hits.hits[0]._source;
  }
  async co2ReductionAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    return [];
    const { range, date_histogram } = setTimeRange(dateDetails);
    const elasticQuery = buildJarghoyeh2Co2AllValueQuery(date_histogram, range);
    const result = await this.elasticService.search(
      JarghoyehService.PLANT_INDEX,
      elasticQuery,
    );
    return result;
  }
  // // fleetManager Services
  async fetchPlantStatus(): Promise<PlantStatusEnum> {
    const elasticquery = {
      size: 0,
      query: {
        bool: {
          must: [
            {
              match_phrase: {
                DeviceName: 'HV1 POWER METER OUT',
              },
            },
            {
              range: {
                DateTime: {
                  gte: 'now-5m',
                  lte: 'now',
                },
              },
            },
          ],
        },
      },
      aggs: {
        group_by_device: {
          terms: {
            field: 'DeviceName.keyword',
            size: 10,
          },
          aggs: {
            latest_record: {
              top_hits: {
                size: 1,
                sort: [
                  {
                    DateTime: {
                      order: 'desc',
                    },
                  },
                ],
                _source: {
                  includes: [
                    'Circuit_Breaker_open',
                    'Circuit_Breaker_close',
                    'DateTime',
                    'DeviceName',
                  ],
                },
              },
            },
          },
        },
      },
    };
    const res = await this.elasticService.search(
      JarghoyehService.PLANT_INDEX,
      elasticquery,
    );
    let equal = false;
    res.aggregations?.group_by_device?.buckets.map((item: any) => {
      const obj = item.latest_record.hits.hits[0]._source.Circuit_Breaker_close;
      const mappedValue = obj == '0000000000000001' ? true : false;
      equal = equal !== mappedValue;
    });
    const status = equal ? PlantStatusEnum.ON_GRID : PlantStatusEnum.ALARM;
    return status;
  }
  override async fetchFullTreeData() {
    const sources = await this.sourceService.readByPlantId(
      JarghoyehService.PLANT_ID,
    );
    const entities =
      await this.entityService.getPlantEntitiesWithSpecificEntityTypeTag(
        JarghoyehService.PLANT_ID,
        ['Inverter', 'PCC_Section', 'SmartLogger', 'Plant'],
      );
    const elasticQuery = buildJarghoyeh2TreeLastValueQuery();
    const response = await this.elasticService.search(
      JarghoyehService.PLANT_INDEX,
      elasticQuery,
    );
    const result = response.aggregations.by_sub.buckets
      .map((subBucket: any) => {
        return subBucket.by_device.buckets.map((deviceBucket: any) => {
          return deviceBucket.latest_record.hits.hits.map((data: any) => {
            const {
              Insulation_resistance: insulationResistance,
              Internal_temperature: internalTemperature,
              Efficiency: performance,
              DateTime,
            } = data._source;
            return {
              deviceTag: `${
                JarghoyehService.PLANT_TAG
              }:${this.sourceService.mapkeyToSubWithSources(
                sources,
                subBucket.key,
              )}:${deviceBucket.key}`,
              DateTime,
              performance,
              insulationResistance,
              internalTemperature,
            };
          });
        });
      })
      .flat()
      .flat();

    const inverterEntities = entities.filter(
      (item) => item.entityType.tag == 'Inverter',
    );
    const inverterTreeResult = inverterEntities.map((inverter: EntityModel) => {
      const elasticResultObj = result.find((obj: any) => obj.deviceTag);
      const { deviceTag, ...rest } = elasticResultObj;
      delete elasticResultObj.deviceTag;
      return {
        ...inverter,
        ...rest,
      };
    });
    const substationEntities = entities.filter(
      (item) => item.entityType.tag == 'SmartLogger',
    );
    const substationResult = await Promise.all(
      substationEntities.map(async (substation: EntityModel) => {
        const { value: performance, Date: DateTime } =
          await this.substationPerformanceLastValue(substation,{} as EntityField);
        const { value: subEnergyLossLess } =
          await this.substaionRawProductionEnergyLastValue(substation);
        const DIState = await this.stateService.fetchActiveState(
          JarghoyehService.PLANT_TAG,
          substation.entityTag,
          'DI status',
        );
        return {
          ...substation,
          DateTime,
          performance,
          production_energy: subEnergyLossLess,
          DIState: DIState ? DIState.state_str : null,
        };
      }),
    );
    const pccEntities = entities.find(
      (item) => item.entityType.tag === 'PCC_Section',
    );
    const plant = entities.find((item) => item.entityType.tag === 'Plant');
    if (!plant) throw new InternalServerErrorException('something goes wrong');
    const { value: performance, Date } = await this.performanceLastValue(plant , {} as EntityField);
    const { value: power } = await this.powerLastValue(plant , {} as EntityField);
    const { value: energyToday } = await this.energyExportTodayLastValue(plant);
    const meterStatus = await this.statusService.fetchMetersStatus(
      JarghoyehService.PLANT_TAG,
    );
    const pccTreeResult = [
      {
        ...pccEntities,
        DateTime: Date,
        performance,
        power,
        energyToday,
        meterStatus,
      },
    ];
    const allTreeResult = [
      ...pccTreeResult,
      ...substationResult,
      ...inverterTreeResult,
    ];
    return allTreeResult;
  }
}
