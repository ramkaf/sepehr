import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  buildJarghoyeh2TreeLastValueQuery,
  ElasticService,
  EntityField,
  EntityModel,
} from 'libs/database';
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
import { SantralPlantService } from '../providers/plant/santral-plant.service';
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { MaskFunctionsEnum } from 'libs/enums';
import {
  extractInverterAndIrradiation,
  getFormattedDateTime,
  setTimeRange,
} from 'libs/utils';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import { PlantDayLightService } from '../providers/day-light/day-light.service';
import { ICurve } from '../interfaces/curve.interface';
import { IResponseLastValue } from '../interfaces/base.service.interface';

@Injectable()
export class Jarghoyeh1Service extends SantralPlantService {
  private static readonly PLANT_INDEX = 'jarghoyeh1-*';
  private static readonly PLANT_TAG = 'jarghoyeh1';
  private static readonly PLANT_ID = 1043;
  private static readonly IRRADIATION_PARAMETER =
    'Irradiance_(temperature_compensated_signal)';
  private static readonly POWER_FACTOR_PARAMETER = 'PF_sign_tot';
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
    // No visibility modifier
    super(
      Jarghoyeh1Service.PLANT_ID,
      Jarghoyeh1Service.PLANT_TAG,
      Jarghoyeh1Service.PLANT_INDEX,
      Jarghoyeh1Service.IRRADIATION_PARAMETER,
      Jarghoyeh1Service.POWER_FACTOR_PARAMETER,
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
      const body = {
        size: 0,
        query: {
          terms: {
            'DeviceName.keyword': [
              'Adam4117 SUB 1',
              'Adam4117 SUB 2',
              'Adam4117 SUB 3',
              'Adam4117 SUB 4',
            ],
          },
        },
        aggs: {
          devices: {
            terms: {
              field: 'DeviceName.keyword',
              size: 4,
            },
            aggs: {
              latest_value: {
                top_hits: {
                  sort: [
                    {
                      DateTime: {
                        order: 'desc',
                      },
                    },
                  ],
                  _source: ['DeviceName', 'CH0', 'DateTime'],
                  size: 1,
                },
              },
            },
          },
        },
      };
      const result = await this.elasticService.search(
        Jarghoyeh1Service.PLANT_INDEX,
        body,
      );
      let totalCh0 = 0;
      let DateTime = null;
      result.aggregations.devices.buckets.forEach((item: any) => {
        DateTime =
          DateTime || item.latest_value.hits.hits[0]._source['DateTime'];
        totalCh0 = totalCh0 + item.latest_value.hits.hits[0]._source['CH0'];
      });
      const mod = (
        totalCh0 / result.aggregations.devices.buckets.length
      ).toFixed(1);
      const maskedValue = this.mask_Function_Service.mask(
        mod,
        MaskFunctionsEnum.ScaleModFromBinaryValue,
      ) as number;
      return {
        value: maskedValue,
        Date: DateTime!,
      };
    } catch (error) {
      console.error(
        `error in ${Jarghoyeh1Service.PLANT_TAG}: modLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  override async modDailyAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    try {
      const should = await this.dayLightService.generateShouldClause(
        this.plantTag,
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
                    'Adam4117 SUB 1',
                    'Adam4117 SUB 2',
                    'Adam4117 SUB 3',
                    'Adam4117 SUB 4',
                  ],
                },
              },
            ],
            should,
            minimum_should_match: 1,
          },
        },

        aggs: {
          devices: {
            terms: {
              field: 'DeviceName.keyword',
              size: 10, // adjust if more devices
            },
            aggs: {
              per_time: {
                date_histogram,
                aggs: {
                  agg: {
                    avg: {
                      field: 'CH0',
                    },
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plantIndex, body);
      const result = this.computeAveragePerDate(response);
      const mapped: IMappedAllValueResult = result.map((item: any) => {
        return {
          DateTime: item.key_as_string,
          value: item.value,
        };
      });
      return this.curveService.buildCurveWithOneValue(mapped, [
        MaskFunctionsEnum.ScaleModFromBinaryValue,
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
              { range },
              {
                terms: {
                  'DeviceName.keyword': [
                    'Adam4117 SUB 1',
                    'Adam4117 SUB 2',
                    'Adam4117 SUB 3',
                    'Adam4117 SUB 4',
                  ],
                },
              },
            ],
          },
        },

        aggs: {
          devices: {
            terms: {
              field: 'DeviceName.keyword',
              size: 10, // adjust if more devices
            },
            aggs: {
              per_time: {
                date_histogram,
                aggs: {
                  agg: {
                    avg: {
                      field: 'CH0',
                    },
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        Jarghoyeh1Service.PLANT_INDEX,
        body,
      );
      const result = this.computeAveragePerDate(response);
      const mapped: IMappedAllValueResult = result.map((item: any) => {
        return {
          DateTime: item.key_as_string,
          value: item.value,
        };
      });
      return this.curveService.buildCurveWithOneValue(mapped, [
        MaskFunctionsEnum.ScaleModFromBinaryValue,
        MaskFunctionsEnum.ToFixed1,
      ]);
    } catch (error) {
      console.error(`error in ${this.plant_Tag}: modAllValues service `, error);
      return this.allValueServicesDefaultExport();
    }
  }
  override async substationPerformanceLastValue(
    entity: EntityModel,
  ): Promise<any> {
    try {
      const { entityTag } = entity;
      const installedPower =
        await this.entityFieldService.fetchStaticValueByTag(
          Jarghoyeh1Service.PLANT_ID,
          'Installed_Power',
        );
      if (!installedPower)
        throw new BadRequestException('Invalid installed power value');
      const substationInstalledPower = parseFloat(installedPower) / 4;
      const { irradiationName, inverterName } =
        extractInverterAndIrradiation(entityTag);
      const elasticQuery = {
        size: 0,
        query: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    { term: { 'DeviceName.keyword': inverterName } },
                    { term: { 'DeviceName.keyword': irradiationName } },
                  ],
                  minimum_should_match: 1,
                },
              },
              {
                range: {
                  DateTime: {
                    gte: 'now-15m',
                    lte: 'now',
                  },
                },
              },
            ],
          },
        },
        aggs: {
          top_active_power_hits: {
            filter: {
              term: { 'DeviceName.keyword': inverterName },
            },
            aggs: {
              hits: {
                top_hits: {
                  size: 1,
                  _source: ['Active_power', 'DateTime'],
                  sort: [{ DateTime: { order: 'desc' } }],
                },
              },
            },
          },
          top_irradiance_hits: {
            filter: {
              term: { 'DeviceName.keyword': irradiationName },
            },
            aggs: {
              hits: {
                top_hits: {
                  size: 1,
                  _source: [
                    'Irradiance_(temperature_compensated_signal)',
                    'DateTime',
                  ],
                  sort: [{ DateTime: { order: 'desc' } }],
                },
              },
            },
          },
        },
      };

      const response = await this.elasticService.search(
        Jarghoyeh1Service.PLANT_INDEX,
        elasticQuery,
      );
      // return response

      const irradiance =
        response.aggregations.top_irradiance_hits.hits.hits.hits[0]._source[
          'Irradiance_(temperature_compensated_signal)'
        ];
      const power =
        response.aggregations.top_active_power_hits.hits.hits.hits[0]._source[
          'Active_power'
        ];
      const maskedPower = this.maskFunctionService.mask(
        power,
        MaskFunctionsEnum.Absolute,
      ) as number;

      let performance = 0;
      if (irradiance > 100) {
        performance =
          (maskedPower * 100) /
          ((substationInstalledPower * irradiance) / 1000);
      }
      const maskedPerformance = this.maskFunctionService.mask(
        performance,
        MaskFunctionsEnum.DecimalToPercentage,
      ) as number;
      return {
        value: maskedPerformance,
        Date: getFormattedDateTime(),
      };
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }
  override async substationPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    const { entityTag } = entity;
    const subNum = entityTag.split(':')[1].split(' ')[1];
    const installedPower = await this.entityFieldService.fetchStaticValueByTag(
      Jarghoyeh1Service.PLANT_ID,
      'Installed_Power',
    );
    const dcToAcMax = await this.entityFieldService.fetchStaticValueByTag(
      Jarghoyeh1Service.PLANT_ID,
      'dc_to_ac_max',
    );
    if (!installedPower)
      throw new BadRequestException('Invalid installed power value');
    let substationCount = 0;
    const substations = await this.plantService.fetchPlantSubstations(
      this.plantId,
    );
    if (substations.length === 0) substationCount = 1;
    substationCount = substations.length;
    const substationInstalledPower =
      parseFloat(installedPower) / substationCount;
    const irradiationDevice = `Irradiation ${subNum}`;
    const inverterDevice = `Inverter ${subNum}`;
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const elasticQuery = {
        size: 0,
        _source: [
          'Irradiance_(temperature_compensated_signal)',
          'Air_temperature_act',
          'Active_power',
          'DateTime',
        ],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': [
                    irradiationDevice,
                    inverterDevice,
                    'Weather station',
                  ],
                },
              },
              {
                range, // <- should be a real object, not a placeholder string
              },
            ],
          },
        },
        aggs: {
          intervals: {
            date_histogram: date_histogram, // <- also needs to be an object
            aggs: {
              max_irradiance: {
                avg: {
                  script: {
                    source: `
                if (doc['DeviceName.keyword'].value == '${irradiationDevice}') {
                  if (doc['Irradiance_(temperature_compensated_signal)'].size() > 0 && doc['Irradiance_(temperature_compensated_signal)'].value > 0) {
                    return doc['Irradiance_(temperature_compensated_signal)'].value;
                  }
                }
                return null;
              `,
                  },
                },
              },
              max_temp: {
                max: { field: 'Air_temperature_act' },
              },
              max_abs_ptotal: {
                avg: {
                  script: {
                    source: `
                if (doc['DeviceName.keyword'].value == '${inverterDevice}') {
                  if (doc['Active_power'].size() > 0 && doc['Active_power'].value > 0) {
                    return Math.abs(doc['Active_power'].value);
                  }
                }
                return null;
              `,
                  },
                },
              },
              performance: {
                bucket_script: {
                  buckets_path: {
                    ptotal: 'max_abs_ptotal',
                    irradiance: 'max_irradiance',
                  },
                  script: `
              if (params.ptotal > 0) {
                return (params.ptotal) * 100 / ((${substationInstalledPower} / ${dcToAcMax}) * params.irradiance );
              } else {
                return 0;
              }
            `,
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        Jarghoyeh1Service.PLANT_INDEX,
        elasticQuery,
      );
      // return response
      const mappedResult: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item: any) => {
          return {
            DateTime: item.key_as_string,
            value: item.performance?.value ?? 0,
          };
        });
      return this.curveService.buildCurveWithOneValue(mappedResult, [
        MaskFunctionsEnum.MultiplyByMillion,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
    } catch (err) {
      console.log(err);
      return [];
    }
  }
  async fetchFullTreeData() {
    const sources = await this.sourceService.readByPlantId(
      Jarghoyeh1Service.PLANT_ID,
    );
    const entities =
      await this.entityService.getPlantEntitiesWithSpecificEntityTypeTag(
        Jarghoyeh1Service.PLANT_ID,
        ['Inverter', 'PCC_Section', 'SmartLogger', 'Plant'],
      );
    const elasticQuery = buildJarghoyeh2TreeLastValueQuery();
    const response = await this.elasticService.search(
      Jarghoyeh1Service.PLANT_INDEX,
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
                Jarghoyeh1Service.PLANT_TAG
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
          await this.substationPerformanceLastValue(substation);
        const { value: subEnergyLossLess } =
          await this.substaionRawProductionEnergyLastValue(substation);
        const DIState = await this.stateService.fetchActiveState(
          Jarghoyeh1Service.PLANT_TAG,
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
    const { value: performance, Date } = await this.performanceLastValue(
      plant,
      {} as EntityField,
    );
    const { value: power } = await this.powerLastValue(
      plant,
      {} as EntityField,
    );
    const { value: energyToday } = await this.energyExportTodayLastValue(
      plant,
      {} as EntityField,
    );
    const meterStatus = await this.statusService.fetchMetersStatus(
      Jarghoyeh1Service.PLANT_TAG,
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
  private computeAveragePerDate(
    esResponse: any,
  ): Array<{ key_as_string: string; value: number }> {
    const devices = esResponse.aggregations.devices.buckets;

    // Map: date → list of avg_ch0 values across devices
    const dateMap: Record<string, number[]> = {};

    for (const device of devices) {
      for (const bucket of device.per_time.buckets) {
        const date = bucket.key_as_string;
        const avg = bucket.agg?.value ?? null;

        if (avg !== null) {
          if (!dateMap[date]) dateMap[date] = [];
          dateMap[date].push(avg);
        }
      }
    }

    // Build result array [{ key_as_string, value }]
    const result = Object.entries(dateMap).reduce<
      Array<{ key_as_string: string; value: number }>
    >((arr, [date, values]) => {
      if (values.length === 0) return arr; // Skip day if all devices missing

      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

      arr.push({
        key_as_string: date,
        value: avg,
      });

      return arr;
    }, []);

    return result;
  }
}
