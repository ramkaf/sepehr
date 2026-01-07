/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  buildWeatherLastValueQuery,
  ElasticService,
  EntityField,
  buildWeatherAllValueQuery,
  EntityModel,
  buildIrradianceLastValueQuery,
  buildIrradianceAllValueQuery,
  buildLatestDeviceFieldElasticQuery,
  buildPowerAllValueQuery,
  buildDeviceParameterAllValueQuery,
  buildMidnightDeviceFieldQuery,
  buildSubstationPerformanceAllValueQuery,
  buildLosslessSubstationEnergyQuery,
  buildPlantPerformanceAllValueQuery,
  buildLatestDeviceObjElasticQuery,
  buildJarghoyeh2TreeLastValueQuery,
  Cacheable,
} from 'libs/database';
import {
  IAllValuesServicesResult,
  IDateDetails,
  IKPiInterface,
  IMappedAllValueResult,
  PeriodEnum,
} from 'libs/interfaces';
import {
  getFormattedDateTime,
  getNestedValue,
  getWeatherFieldElasticPath,
  logStringify,
  msToTime,
  setTimeRange,
} from 'libs/utils';
import {
  IResponseLastValue,
  IResponseStringsLastValue,
} from '../../interfaces/base.service.interface';
import {
  EntityFieldService,
  EntityService,
  PlantService,
  PlantStateService,
  PlantStatusService,
} from '../../../insight';
import { CurveModelService } from '../curve/curve.factory.service';
import { SourceService } from '../../../entity-management';
import { DEFAULT_DATE_DETAILS, WEATHER_INDEX } from 'libs/constants';
import { ICurve } from '../../interfaces/curve.interface';
import {
  EntityFieldPeriodFunctionEnum,
  MaskFunctionsEnum,
  RangeTypeEnum,
} from 'libs/enums';
import { EnergyService } from '../../power-plant-custom-services/energy.service';
import { MaskFunctionService } from '../mask-functions/mask-function.service';
import { BasePlantService } from './base-plant.service';
import { PlantDayLightService } from '../day-light/day-light.service';

@Injectable()
export abstract class StringPlantService extends BasePlantService {
  constructor(
    private readonly plantId: number,
    private readonly plantTag: string,
    private readonly plantIndex: string,
    private readonly irradiationParameter: string,
    private readonly powerFactorParameter: string,
    protected readonly elasticService: ElasticService,
    protected readonly plantService: PlantService,
    protected readonly curveService: CurveModelService,
    protected readonly entityFieldService: EntityFieldService,
    protected readonly entityService: EntityService,
    protected readonly statusService: PlantStatusService,
    protected readonly sourceService: SourceService,
    protected readonly maskFunctionService: MaskFunctionService,
    protected readonly stateService: PlantStateService,
    protected readonly energyService: EnergyService,
    protected readonly dayLightService: PlantDayLightService,
  ) {
    super(
      plantId,
      plantTag,
      plantIndex,
      irradiationParameter,
      powerFactorParameter,
      elasticService,
      plantService,
      curveService,
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

  async powerLastValue(entity: EntityModel , entityField : EntityField): Promise<IResponseLastValue> {
    try {
      const hvsEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      if (hvsEntities.length === 0)
        return this.lastValueServicesDefaultExport();
      const hvDevices = hvsEntities.map((item) => item.entityTag.split(':')[2]);
      const currentPowerQueries = hvDevices.map((entityTag) =>
        buildLatestDeviceFieldElasticQuery(entityTag, 'P_total'),
      );
      const currentPowerResults = await Promise.all(
        currentPowerQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const DateTime = currentPowerResults[0].hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      let power = 0;
      currentPowerResults.forEach((item) => {
        const hvPower = item.hits.hits[0]._source['P_total'] ?? 0;
        power = power + hvPower;
      });
      const maskedPower = this.maskFunctionService.mask(
        power,
        MaskFunctionsEnum.ReLUReverse,
      ) as number;
      return {
        value: maskedPower,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: powerLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async powerAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    const { range, date_histogram } = setTimeRange(dateDetails);
    const elasticQuery = buildPowerAllValueQuery(
      'ION METER',
      'kW_tot',
      date_histogram,
      range,
    );
    const result = await this.elasticService.search(
      this.plantIndex,
      elasticQuery,
    );

    const hvEntities = await this.plantService.fetchPlantHvEntity(this.plantId);
    try {
      const powers = await Promise.all(
        hvEntities.map(async (entity) => {
          const { entityTag } = entity;
          const hvDevice = entityTag.split(':')[2];
          const query = buildPowerAllValueQuery(
            hvDevice,
            'P_total',
            date_histogram,
            range,
          );
          const result = await this.elasticService.search(
            this.plantIndex,
            query,
          );
          return {
            hvDevice,
            data: result.aggregations.power_over_time.buckets.map(
              (item: any) => ({
                DateTime: item.key_as_string,
                value: item.aggs?.value || 0,
              }),
            ),
          };
        }),
      );
      const sumPowerOfHvs = powers[0].data.map((item: any, index: number) => {
        const totalValue = powers.reduce((sum, currentEntity) => {
          return sum + (currentEntity.data[index]?.value || 0);
        }, 0);

        return {
          DateTime: item.DateTime,
          value: totalValue,
        };
      });
      // const sumPowerOfHvs: IMappedAllVAlueObj[] = [];
      return this.curveService.buildCurveWithOneValue(sumPowerOfHvs, [
        MaskFunctionsEnum.ReLUReverse,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: powerAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async energyImportTodayLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    try {
      const hvsEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      if (hvsEntities.length === 0)
        return this.lastValueServicesDefaultExport();
      const hvDevices = hvsEntities.map((item) => item.entityTag.split(':')[2]);
      const currentEngQueries = hvDevices.map((entityTag) =>
        buildLatestDeviceFieldElasticQuery(entityTag, 'Energy_imp._Total'),
      );
      const currentEngResults = await Promise.all(
        currentEngQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const midnightEngQueries = hvDevices.map((entityTag) =>
        buildMidnightDeviceFieldQuery(entityTag, 'Energy_imp._Total'),
      );
      const midnightEngResults = await Promise.all(
        midnightEngQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const DateTime = currentEngResults[0].hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      let midnightEng = 0;
      midnightEngResults.forEach((item) => {
        const midnightHvEng =
          item.hits.hits[0]._source['Energy_imp._Total'] ?? 0;
        midnightEng = midnightEng + midnightHvEng;
      });
      let currentEng = 0;
      currentEngResults.forEach((item) => {
        const currentHvEng =
          item.hits.hits[0]._source['Energy_imp._Total'] ?? 0;
        currentEng = currentEng + currentHvEng;
      });
      return {
        value: currentEng - midnightEng,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyImportTodayLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async energyImportTodayAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    try {
      const { mode } = dateDetails;
      const fetchMap = {
        M: this.energyService.fetchStringEnergyTodayAllValueMonthly,
        D: this.energyService.fetchStringEnergyTodayAllValueDaily,
        Y: this.energyService.fetchStringEnergyTodayAllValueYearly,
        C: this.energyService.fetchStringEnergyTodayAllValueCustom,
        default: this.energyService.fetchStringEnergyTodayAllValueCustom,
      };

      const fetchFn = fetchMap[mode] || fetchMap.default;
      const result = await fetchFn.call(
        this.energyService,
        this.plantIndex,
        dateDetails,
        'Energy_imp._Total',
      );

      return result;
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyImportTodayAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async energyImportTotalLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    try {
      const hvsEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const hvDevices = hvsEntities.map((item) => item.entityTag.split(':')[2]);
      if (hvsEntities.length === 0)
        return this.lastValueServicesDefaultExport();

      const currentQueries = hvDevices.map((entityTag) =>
        buildLatestDeviceFieldElasticQuery(entityTag, 'Energy_imp._Total'),
      );

      const currentResults = await Promise.all(
        currentQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const DateTime = currentResults[0].hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      let energy = 0;
      currentResults.forEach((item) => {
        const res = item.hits.hits[0]._source['Energy_imp._Total'] ?? 0;
        energy = energy + res;
      });
      return {
        value: energy,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyImportTotalLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async energyImportTotalAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const parameter = 'Energy_imp._Total';
      const hvEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const hvDevices = hvEntities.map((item) => item.entityTag.split(':')[2]);
      const results = await Promise.all(
        hvDevices.map((device) =>
          this.elasticService.search(
            this.plantIndex,
            buildDeviceParameterAllValueQuery(
              device,
              parameter,
              date_histogram,
              range,
            ),
          ),
        ),
      );
      const combined = new Map<string, number>();

      for (const res of results) {
        for (const bucket of res.aggregations.parameter_over_time.buckets) {
          const time = bucket.key_as_string;
          const value = bucket.param?.value ?? 0;
          combined.set(time, (combined.get(time) ?? 0) + value);
        }
      }

      // Convert to array result
      const mappedResult = Array.from(combined, ([DateTime, value]) => ({
        DateTime,
        value,
      }));

      return this.curveService.buildCurveWithOneValue(mappedResult);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyImportTotalAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async energyExportTotalLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    try {
      const hvsEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const hvDevices = hvsEntities.map((item) => item.entityTag.split(':')[2]);
      if (hvsEntities.length === 0)
        return this.lastValueServicesDefaultExport();

      const currentQueries = hvDevices.map((entityTag) =>
        buildLatestDeviceFieldElasticQuery(entityTag, 'Energy_exp._Total'),
      );

      const currentResults = await Promise.all(
        currentQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const DateTime = currentResults[0].hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      let energy = 0;
      currentResults.forEach((item) => {
        const res = item.hits.hits[0]._source['P_total'] ?? 0;
        energy = energy + res;
      });
      return {
        value: energy,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyImportTotaLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async energyExportTotalAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    const { range, date_histogram } = setTimeRange(dateDetails);
    try {
      const hvEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      if (hvEntities.length === 0) return this.allValueServicesDefaultExport();
      const hvDevices = hvEntities.map((item) => item.entityTag.split(':')[2]);
      const result = await Promise.all(
        hvDevices.map(async (device) => {
          const query = buildDeviceParameterAllValueQuery(
            device,
            'Energy_exp._Total',
            date_histogram,
            range,
          );
          const result = await this.elasticService.search(
            this.plantIndex,
            query,
          );
          return {
            device,
            data: result.aggregations.parameter_over_time.buckets.map(
              (item: any) => ({
                DateTime: item.key_as_string,
                value: item.param?.value || 0,
              }),
            ),
          };
        }),
      );
      const mergeAndSumValues = result[0].data.map(
        (item: any, index: number) => {
          const totalValue = result.reduce((sum, currentEntity) => {
            return sum + (currentEntity.data[index]?.value || 0);
          }, 0);

          return {
            DateTime: item.DateTime,
            value: totalValue,
          };
        },
      );
      return this.curveService.buildCurveWithOneValue(
        mergeAndSumValues,
        MaskFunctionsEnum.Absolute,
      );
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyExportTotalAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async energyExportTodayLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    try {
      const hvsEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      if (hvsEntities.length === 0)
        return this.lastValueServicesDefaultExport();
      const hvDevices = hvsEntities.map((item) => item.entityTag.split(':')[2]);
      const currentEngQueries = hvDevices.map((entityTag) =>
        buildLatestDeviceFieldElasticQuery(entityTag, 'Energy_exp._Total'),
      );
      const currentEngResults = await Promise.all(
        currentEngQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const midnightEngQueries = hvDevices.map((entityTag) =>
        buildMidnightDeviceFieldQuery(entityTag, 'Energy_exp._Total'),
      );
      const midnightEngResults = await Promise.all(
        midnightEngQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const DateTime = currentEngResults[0].hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      let midnightEng = 0;
      midnightEngResults.forEach((item) => {
        const midnightHvEng =
          item.hits.hits[0]._source['Energy_exp._Total'] ?? 0;
        midnightEng = midnightEng + midnightHvEng;
      });
      let currentEng = 0;
      currentEngResults.forEach((item) => {
        const currentHvEng =
          item.hits.hits[0]._source['Energy_exp._Total'] ?? 0;
        currentEng = currentEng + currentHvEng;
      });
      return {
        value: currentEng - midnightEng,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyExportTodayLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async energyExportTodayAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    try {
      const { mode } = dateDetails;
      const metric = 'Energy_exp._Total';
      const plantIndex = this.plantIndex;

      const fetchMap = {
        M: this.energyService.fetchStringEnergyTodayAllValueMonthly,
        D: this.energyService.fetchStringEnergyTodayAllValueDaily,
        Y: this.energyService.fetchStringEnergyTodayAllValueYearly,
        C: this.energyService.fetchStringEnergyTodayAllValueCustom,
        default: this.energyService.fetchStringEnergyTodayAllValueCustom,
      };

      const fetchFn = fetchMap[mode] || fetchMap.default;
      const result = await fetchFn.call(
        this.energyService,
        plantIndex,
        dateDetails,
        metric,
      );

      return result;
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyExportTodayAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async irradiationLastValue(entity: EntityModel , entityField:EntityField): Promise<IResponseLastValue> {
    try {
      const irradiationDevices =
        await this.plantService.fetchPlantIrradiationDevices(this.plantId);
      const irradiationDevicesName = irradiationDevices.map(
        (item) => item.entityTag.split(':')[2],
      );
      if (irradiationDevices.length === 0)
        return this.lastValueServicesDefaultExport();
      const elasticQuery = buildIrradianceLastValueQuery(
        irradiationDevicesName,
        this.irradiationParameter,
      );
      const response = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const { averageIrradiance: value, latestDateTime: Date } =
        this.processIrradiationData(
          response.aggregations.last_irradiance_per_device.buckets,
          this.irradiationParameter,
        );
      if (!Date || !value) return this.lastValueServicesDefaultExport();
      const maskedValue = this.maskFunctionService.mask(
        value,
        MaskFunctionsEnum.ReLU,
      ) as number;
      return {
        value: maskedValue,
        Date,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: irradiationLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async irradiationDailyAllValues(
  entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails
) {
  try {
    const { range, date_histogram } = setTimeRange(dateDetails);
    const should = await this.dayLightService.generateShouldClause(this.plantTag , dateDetails);
    const irradiationEntities = await this.plantService.fetchPlantIrradiationDevices(this.plantId)
    const irradiationDevices = irradiationEntities.map(item => item.entityTag.split(":")[2])
    const body = {
      query: {
        bool: {
          must: [
            {
              terms: {
                'DeviceName.keyword': irradiationDevices,
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
      size: 0, // histogram → no docs needed
      aggs: {
        intervals: {
          date_histogram, // your existing histogram settings
          aggs: {
            irradiance: {
              avg: {
                field: this.irradiationParameter,
              },
            },
          },
        },
      },
    };
    const response = await this.elasticService.search(this.plantIndex , body)
    const mapped:IMappedAllValueResult = response.aggregations.intervals.buckets.map((item) => {
      return {
        value : item.irradiance?.value ?? 0,
        DateTime :  item.key_as_string,
      }
    });
    return this.curveService.buildCurveWithOneValue(mapped , MaskFunctionsEnum.NumberStringToNFixedNumber)
  } catch (error) {
      console.error(
        `error in ${this.plantTag}: dailyIrradianceAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
  }
}
  async irradiationAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const irradiationDevices =
        await this.plantService.fetchPlantIrradiationDevices(this.plantId);
      const irradiationDevicesName = irradiationDevices.map(
        (item) => item.entityTag.split(':')[2],
      );
      if (irradiationDevices.length === 0)
        return this.allValueServicesDefaultExport();
      const elasticQuery: any = buildIrradianceAllValueQuery(
        irradiationDevicesName,
        this.irradiationParameter,
        range,
        date_histogram,
      );
      // return {elasticQuery}
      const response = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const mappedResult: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item: any) => {
          return {
            DateTime: item.key_as_string,
            value: item.irradiance.value ?? 0,
          };
        });
      return this.curveService.buildCurveWithOneValue(
        mappedResult,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: irradiationAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async performanceLastValue(entity: EntityModel , entityField : EntityField) {
    try {
      const nominalPower = await this.entityFieldService.fetchStaticValueByTag(
        this.plantId,
        'Nominal_Power',
      );
      if (!nominalPower) return this.lastValueServicesDefaultExport();
      const { value: irradiance, Date: irradianceDateTime } =
        await this.irradiationLastValue(entity , entityField);
      const { value: pTotal, Date: powerDateTime } =
        await this.powerLastValue(entity,{} as EntityField);
      if (!pTotal || !irradiance) return this.lastValueServicesDefaultExport();
      const DateTime = irradianceDateTime || powerDateTime || NaN;
      let performance = 0;
      if (irradiance > 0 && pTotal < 0) {
        performance =
          (-pTotal * 100) / (1.179 * parseFloat(nominalPower) * irradiance);
      }
      if (performance > 100) {
        performance = 100;
      }
      return {
        value: performance,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: performanceLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async performanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const irradiationEntities =
        await this.plantService.fetchPlantIrradiationDevices(this.plantId);
      const hvEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const nominalPower = await this.entityFieldService.fetchStaticValueByTag(
        this.plantId,
        'Nominal_Power',
      );
      const dcToAcMax = await this.entityFieldService.fetchStaticValueByTag(
        this.plantId,
        'dc_to_ac_max',
      );
      const powerParameter =
        await this.entityFieldService.fetchHvPowerParameter(this.plantId);
      if (
        irradiationEntities.length === 0 ||
        hvEntities.length === 0 ||
        !nominalPower ||
        !dcToAcMax ||
        !powerParameter
      )
        return this.allValueServicesDefaultExport();
      const hvDevices = hvEntities.map((item) => item.entityTag.split(':')[2]);
      const irradiationDevices = irradiationEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      const elasticQuery = buildPlantPerformanceAllValueQuery(
        nominalPower,
        date_histogram,
        range,
        irradiationDevices,
        this.irradiationParameter,
        powerParameter.maskFunction,
        hvDevices,
        dcToAcMax,
      );
      // return elasticQuery
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      // return {result , elasticQuery}
      const mappedResult: IMappedAllValueResult =
        result.aggregations.intervals.buckets.map((item: any) => {
          return {
            DateTime: item.key_as_string,
            value: item.performance?.value ?? 0,
          };
        });
      return this.curveService.buildCurveWithOneValue(mappedResult);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: performanceAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async powerFactorLastValue(entity: EntityModel): Promise<IResponseLastValue> {
    try {
      const hvEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const hvDevices = hvEntities.map((item) => item.entityTag.split(':')[2]);
      if (hvEntities.length === 0) return this.lastValueServicesDefaultExport();

      const currentQueries = hvDevices.map((entityTag) =>
        buildLatestDeviceFieldElasticQuery(
          entityTag,
          this.powerFactorParameter,
        ),
      );

      const currentResults = await Promise.all(
        currentQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const DateTime = currentResults[0].hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      let powerFactor = 0;
      currentResults.forEach((item) => {
        const res = item.hits.hits[0]._source[this.powerFactorParameter] ?? 0;
        powerFactor = powerFactor + res;
      });
      const maskedValue = this.maskFunctionService.mask(
        powerFactor,
        MaskFunctionsEnum.ReLUReverse,
      ) as number;
      return {
        value: maskedValue,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: powerFactorLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async stringPowerLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ): Promise<IResponseLastValue> {
    try {
      const { entityTag } = entity;
      const { efId, fieldTag, etId } = entityField;
      const match = fieldTag.match(/\d+/);
      const stringPowerNumber = match ? match[0] : null;
      if (!stringPowerNumber) {
        throw new BadRequestException(
          `Invalid string power parameter: "${fieldTag}" does not contain a valid number.`,
        );
      }
      const currentParameter = `PV${stringPowerNumber}_current`;
      const voltageParameter = `PV${stringPowerNumber}_voltage`;
      const voltageAndCurrentTags =
        await this.entityFieldService.fetchStringsPowerVoltageAndCurrentParameters(
          etId,
        );
      const period = await this.entityFieldService.fetchParameterPeriod(efId);
      const functionName =
        period?.functionName ?? EntityFieldPeriodFunctionEnum.Avg;
      const rangeType = period?.rangeType ?? RangeTypeEnum.Minute;
      const rangeValue = period?.rangeValue ?? 15;
      const data = await this.stringPowerElasticResult(
        this.plantIndex,
        entityTag,
        functionName,
        rangeType,
        rangeValue,
        voltageAndCurrentTags,
      );
      if (!data) return this.lastValueServicesDefaultExport();
      const power = data[currentParameter].value * data[voltageParameter].value;
      const maskedValue = this.maskFunctionService.mask(power, [
        entityField.maskFunction,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]) as number;
      return {
        value: maskedValue,
        Date: data['key_as_string'],
      };
    } catch (error) {
      console.error(error);
      return this.lastValueServicesDefaultExport();
    }
  }
  async stringPowerAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    try {
      const { entityTag } = entity;
      const [, substation, deviceName] = entityTag.split(':');
      const { fieldTag } = entityField;
      const { range, date_histogram } = setTimeRange(dateDetails);
      const match = fieldTag.match(/\d+/);
      const stringPowerNumber = match ? match[0] : null;
      if (!stringPowerNumber) {
        throw new BadRequestException(
          `Invalid string power parameter: "${fieldTag}" does not contain a valid number.`,
        );
      }
      const key = await this.sourceService.mapSubToKeyWithSources(
        this.plantId,
        substation,
      );
      const logWithPrefix = `*${key}*`;
      const [, , stringNumber] = fieldTag.split('_');
      const currentParameter = `PV${stringNumber}_current`;
      const voltageParameter = `PV${stringNumber}_voltage`;
      const elasticQuery = {
        size: 0,
        _source: false,
        query: {
          bool: {
            must: [
              {
                match: {
                  'DeviceName.keyword': deviceName,
                },
              },
              {
                wildcard: {
                  'log.file.path.keyword': logWithPrefix,
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
              [currentParameter]: {
                avg: {
                  field: currentParameter,
                },
              },
              [voltageParameter]: {
                avg: {
                  field: voltageParameter,
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const data = response.aggregations.intervals?.buckets ?? [];
      const mappedResult: IMappedAllValueResult = data.map((item: any) => {
        const currentValue = item[currentParameter].value;
        const voltageValue = item[voltageParameter].value;
        return {
          value: currentValue * voltageValue,
          DateTime: item['key_as_string'],
        };
      });
      return this.curveService.buildCurveWithOneValue(mappedResult, [
        entityField.maskFunction,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: stringPowerAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async inverterPowerTotalLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ) {
    try {
      const { entityTag } = entity;
      const { efId, etId } = entityField;
      const [, substation, deviceName] = entityTag.split(':');
      const key = await this.sourceService.mapSubToKeyWithSources(
        this.plantId,
        substation,
      );
      const logWithPrefix = `*${key}*`;
      const period = await this.entityFieldService.fetchParameterPeriod(efId);
      const functionName =
        period?.functionName ?? EntityFieldPeriodFunctionEnum.Avg;
      const rangeType = period?.rangeType ?? RangeTypeEnum.Minute;
      const rangeValue = period?.rangeValue ?? 15;
      const powerAndVoltagesTags =
        await this.entityFieldService.fetchStringsPowerVoltageAndCurrentParameters(
          etId,
        );
      const aggs = powerAndVoltagesTags.reduce<Record<string, any>>(
        (acc, field) => {
          acc[field] = { [functionName]: { field } };
          return acc;
        },
        {},
      );
      const body = {
        size: 0,
        _source: false,
        query: {
          bool: {
            must: [
              {
                match: {
                  'DeviceName.keyword': deviceName,
                },
              },
              {
                wildcard: {
                  'log.file.path.keyword': logWithPrefix,
                },
              },
              {
                range: {
                  DateTime: {
                    gte: `now-${rangeValue}${rangeType}`,
                    lte: 'now',
                    time_zone: 'Asia/Tehran',
                  },
                },
              },
            ],
          },
        },
        aggs,
      };
      // return body

      const response = await this.elasticService.search(this.plantIndex, body);
      // return {body , response}
      const data = response.aggregations ?? [];

      let totalPower = 0;
      for (let i = 1; i <= powerAndVoltagesTags.length; i++) {
        const vKey = `PV${i}_voltage`;
        const cKey = `PV${i}_current`;
        if (data[vKey] && data[cKey]) {
          const voltage = data[vKey].value || 0;
          const current = data[cKey].value || 0;
          const power = voltage * current;
          totalPower += power;
        }
      }
      return {
        lastValue: totalPower,
        Date: getFormattedDateTime(),
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: inverterPowerTotalLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async inverterPowerTotalAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { entityTag } = entity;
      const { range, date_histogram } = setTimeRange(dateDetails);
      const { etId } = entityField;
      const [, substation, deviceName] = entityTag.split(':');
      const key = await this.sourceService.mapSubToKeyWithSources(
        this.plantId,
        substation,
      );
      const logWithPrefix = `*${key}*`;
      const powerAndVoltagesTags =
        await this.entityFieldService.fetchStringsPowerVoltageAndCurrentParameters(
          etId,
        );
      const aggs = powerAndVoltagesTags.reduce<Record<string, any>>(
        (acc, field) => {
          acc[field] = { ['avg']: { field } };
          return acc;
        },
        {},
      );
      const elasticQuery = {
        size: 0,
        _source: false,
        query: {
          bool: {
            must: [
              {
                match: {
                  'DeviceName.keyword': deviceName,
                },
              },
              {
                wildcard: {
                  'log.file.path.keyword': logWithPrefix,
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
            aggs,
          },
        },
      };
      const response = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const mappedResult: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item: any) => {
          let totalPower = 0;
          for (let i = 1; i <= powerAndVoltagesTags.length / 2; i++) {
            const vKey = `PV${i}_voltage`;
            const cKey = `PV${i}_current`;
            if (item[vKey] && item[cKey]) {
              const voltage = item[vKey].value || 0;
              const current = item[cKey].value || 0;
              const power = voltage * current;
              totalPower += power;
            }
          }
          return {
            value: totalPower,
            DateTime: item.key_as_string,
          };
        });

      return this.curveService.buildCurveWithOneValue(mappedResult, [
        entityField.maskFunction,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: inverterPowerTotalAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport;
    }
  }

  async substationPerformanceLastValue(
    entity: EntityModel,
    entityField : EntityField
  ): Promise<IResponseLastValue> {
    try {
      const { entityTag } = entity;
      const nominalPower = await this.entityFieldService.fetchStaticValueByTag(
        this.plantId,
        'Installed_Power',
      );
      if (!nominalPower) return this.lastValueServicesDefaultExport();
      const substations = await this.plantService.fetchPlantSubstations(
        this.plantId,
      );
      if (substations.length === 0)
        return this.lastValueServicesDefaultExport();
      const installedSubstationPower =
        parseFloat(nominalPower) / substations.length;
      const device = `MV POWER METER SUB ${entityTag
        .split(':')[1]
        .slice(11, 12)}`;
      const { value: irradiance } = await this.irradiationLastValue(entity , entityField);
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        device,
        'P_total',
      );
      const response = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const pTotal = response.hits.hits[0]._source['P_total'];
      let performance = 0;
      if (irradiance > 0 && pTotal < 0) {
        performance =
          (-pTotal * 100) /
          ((1.179 * installedSubstationPower * irradiance) / 1000);
      }
      const maskedValue = this.maskFunctionService.mask(
        performance,
        MaskFunctionsEnum.DecimalToPercentage,
      ) as number;
      return {
        value: maskedValue,
        Date: response.hits.hits[0]._source.DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: substationPerformanceLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async substationPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    const { entityTag } = entity;
    const installedPower = await this.entityFieldService.fetchStaticValueByTag(
      this.plantId,
      'Installed_Power',
    );
    if (!installedPower) return this.allValueServicesDefaultExport();
    const { range, date_histogram } = setTimeRange(dateDetails);
    const substations = await this.plantService.fetchPlantSubstations(
      this.plantId,
    );
    if (substations.length === 0) return this.allValueServicesDefaultExport();
    const irradiationEntities =
      await this.plantService.fetchPlantIrradiationDevices(this.plantId);
    if (irradiationEntities.length === 0)
      return this.allValueServicesDefaultExport();
    const irradiationDevices = irradiationEntities.map(
      (item) => item.entityTag.split(':')[2],
    );
    const subInstalledPower =
      parseFloat(installedPower) /
      (substations.length === 0 ? 1 : substations.length);
    const device = `MV POWER METER SUB ${entityTag
      .split(':')[1]
      .slice(11, 12)}`;
    try {
      const elasticQuery = buildSubstationPerformanceAllValueQuery(
        device,
        subInstalledPower,
        date_histogram,
        range,
        irradiationDevices,
        this.irradiationParameter,
        entityField.maskFunction,
      );
      // return elasticQuery
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      // return result
      // return response.aggregations
      const mappedResult: IMappedAllValueResult =
        result.aggregations.intervals.buckets.map((item: any) => {
          return {
            DateTime: item.key_as_string,
            value: item.performance?.value ?? 0,
          };
        });
      return this.curveService.buildCurveWithOneValue(mappedResult);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: substationPerformanceAllValue service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  //smartlogger
  async substaionRawProductionEnergyLastValue(
    entity: EntityModel,
  ): Promise<any> {
    try {
      const [, substation, deviceName] = entity.entityTag.split(':');
      const key = this.sourceService.mapSubToKeyWithSources(
        this.plantId,
        substation,
      );
      if (!key) return this.lastValueServicesDefaultExport();
      const logFilePrefix = '*' + key + '*';
      const body = buildLosslessSubstationEnergyQuery(
        deviceName,
        logFilePrefix,
      );
      const result = await this.elasticService.search(this.plantIndex, body);
      return {
        value: result.hits.hits[0]._source['E-Daily'],
        Date: result.hits.hits[0]._source.DateTime,
      };
    } catch (error) {
      console.log(
        `error in ${this.plantTag} substaionRawProductionEnergyLastValue lastValue : ` +
          error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async substaionRawProductionEnergyAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { mode } = dateDetails;

      const fetchMap = {
        M: this.energyService
          .fetchStringPlantSmartLoggerEnergyAfterLossessMonthly,
        D: this.energyService
          .fetchStringPlantSmartLoggerEnergyAfterLossessDaily,
        Y: this.energyService
          .fetchStringPlantSmartLoggerEnergyAfterLossessYearly,
        C: this.energyService
          .fetchStringPlantSmartLoggerEnergyAfterLossessCustom,
        default:
          this.energyService
            .fetchStringPlantSmartLoggerEnergyAfterLossessCustom,
      };

      const fetchFn = fetchMap[mode] || fetchMap.default;
      const result = await fetchFn.call(
        this.energyService,
        this.plantId,
        entity,
        this.plantIndex,
        dateDetails,
      );

      return result;
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: smartLoggerEnergyAfterLossessAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  //mv
  async substaionNetEnergyLastValue(entity: EntityModel) {
    const tag = entity.entityTag.split(':');
    const deviceName = tag[2];
    try {
      const currentEnergyMVQuery = buildLatestDeviceFieldElasticQuery(
        deviceName,
        'Energy_exp._Total',
      );
      const midnightEnergyMVQuery = buildMidnightDeviceFieldQuery(
        deviceName,
        'Energy_exp._Total',
      );
      const currentEnergyMV = await this.elasticService.search(
        this.plantIndex,
        currentEnergyMVQuery,
      );
      const midnightEnergyMV = await this.elasticService.search(
        this.plantIndex,
        midnightEnergyMVQuery,
      );
      // return {a:currentEnergyMV.hits.hits[0]._source['Energy_exp._Total'] , b:midnightEnergyMV.hits.hits[0]._source['Energy_exp._Total']}
      const e =
        currentEnergyMV.hits.hits[0]._source['Energy_exp._Total'] -
        midnightEnergyMV.hits.hits[0]._source['Energy_exp._Total'];
      const datetime = currentEnergyMV.hits.hits[0]._source.DateTime;
      return {
        value: e,
        Date: datetime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: substationNetEnergyAfterLossesLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async substaionNetEnergyTodayAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { mode } = dateDetails;
      const fetchMap = {
        M: this.energyService.fetchMVEnergyTodayAllValueMonthly,
        D: this.energyService.fetchMVEnergyTodayAllValueDaily,
        Y: this.energyService.fetchMVEnergyTodayAllValueYearly,
        C: this.energyService.fetchMVEnergyTodayAllValueCustom,
        default: this.energyService.fetchMVEnergyTodayAllValueCustom,
      };

      const fetchFn = fetchMap[mode] || fetchMap.default;
      const result = await fetchFn.call(
        this.energyService,
        this.plantIndex,
        entity,
        dateDetails,
        'Energy_exp._Total',
      );

      return result;
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: substaionNetEnergyTodayAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async substaionNetImportedEnergyLastValue(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    const tag = entity.entityTag.split(':');
    const deviceName = tag[2];
    try {
      const currentEnergyMVQuery = buildLatestDeviceFieldElasticQuery(
        deviceName,
        'Energy_imp._Total',
      );
      const midnightEnergyMVQuery = buildMidnightDeviceFieldQuery(
        deviceName,
        'Energy_imp._Total',
      );
      const currentEnergyMV = await this.elasticService.search(
        this.plantIndex,
        currentEnergyMVQuery,
      );
      const midnightEnergyMV = await this.elasticService.search(
        this.plantIndex,
        midnightEnergyMVQuery,
      );
      const eLastValue =
        currentEnergyMV.hits.hits[0]._source['Energy_imp._Total'] -
        midnightEnergyMV.hits.hits[0]._source['Energy_imp._Total'];
      const datetime = currentEnergyMV.hits.hits[0]._source.DateTime;
      return {
        value: eLastValue,
        Date: datetime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: substaionNetImportedEnergyLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async substaionNetImportedEnergyTodayValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { mode } = dateDetails;
      const fetchMap = {
        M: this.energyService.fetchMVEnergyTodayAllValueMonthly,
        D: this.energyService.fetchMVEnergyTodayAllValueDaily,
        Y: this.energyService.fetchMVEnergyTodayAllValueYearly,
        C: this.energyService.fetchMVEnergyTodayAllValueCustom,
        default: this.energyService.fetchMVEnergyTodayAllValueCustom,
      };

      const fetchFn = fetchMap[mode] || fetchMap.default;
      const result = await fetchFn.call(
        this.energyService,
        this.plantIndex,
        entity,
        dateDetails,
        'Energy_imp._Total',
      );

      return result;
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: substaionNetImportedEnergyTodayValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async weatherLastValue(entity: EntityModel) {
    try {
      const elasticQuery = buildWeatherLastValueQuery(this.plantId);
      const result = await this.elasticService.search(
        WEATHER_INDEX,
        elasticQuery,
      );
      return this.flattenWeather(result.hits.hits[0]._source);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: weatherLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async weatherAllValues(
    entityTag: string,
    weatherParameter: EntityField,
    dateDetails: IDateDetails,
  ) {
    const { fieldTag } = weatherParameter;
    const field = getWeatherFieldElasticPath(fieldTag);

    // eslint-disable-next-line prefer-const
    let { range, date_histogram } = setTimeRange(dateDetails);

    if (
      dateDetails.mode === PeriodEnum.C ||
      dateDetails.mode === PeriodEnum.Default
    )
      date_histogram = {
        field: 'DateTime',
        fixed_interval: `3h`,
        time_zone: 'Asia/Tehran',
      };

    const body = buildWeatherAllValueQuery(
      this.plantId,
      field,
      date_histogram,
      range,
    );
    const result = await this.elasticService.search(WEATHER_INDEX, body);
    const mappedAllValueResult = result.aggregations.by_date.buckets.map(
      (item: any) => {
        return {
          DateTime: item.key_as_string,
          max: item.max.value,
          min: item.min.value,
          avg: item.avg.value,
          current: getNestedValue(
            item.currentValue.hits.hits[0]._source,
            field,
          ),
        };
      },
    );
    return this.curveService.buildCurve(
      mappedAllValueResult,
      weatherParameter.maskFunction,
    );
  }
  async fetchEnergyToday(): Promise<string> {
    try {
      const unit = this.entityFieldService.fetchPlantEntityFieldUnitByTag(
        this.plantId,
        'Energy_today',
      );
      const { value } = await this.energyExportTodayLastValue(
        {} as EntityModel,
      );
      // const maskedValue =
      //   this.maskFunctionService.formatReadableNumber(value);
      const maskedValue = this.maskFunctionService.mask(
        value,
        MaskFunctionsEnum.FormatReadableNumber,
      ) as number;
      return unit ? `${maskedValue} ${unit}` : maskedValue.toString();
    } catch (error) {
      return NaN.toString();
    }
  }
  async fetchIrradiance(): Promise<ICurve> {
    try {
      return await this.irradiationAllValues(
        {} as EntityModel,
        {} as EntityField,
        DEFAULT_DATE_DETAILS,
      );
    } catch (error) {
      console.error(
        `Error fetching ${this.plantTag} fleet Maanger Irradiance`,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async fetchPerformance(): Promise<ICurve> {
    try {
      return await this.performanceAllValues(
        {} as EntityModel,
        {} as EntityField,
        DEFAULT_DATE_DETAILS,
      );
    } catch (error) {
      console.error(
        `Error fetching ${this.plantTag} fleet Maanger Performance`,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async fetchAvailability(): Promise<ICurve> {
    try {
      return await this.availabilityAllValues(
        { entityTag: this.plantTag } as EntityModel,
        {} as EntityField,
        DEFAULT_DATE_DETAILS,
      );
    } catch (error) {
      console.error(
        `Error fetching ${this.plantTag} fleet Maanger Availability`,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async fetchPowerFactor(): Promise<string> {
    try {
      const unit = await this.entityFieldService.fetchPlantEntityFieldUnitByTag(
        this.plantId,
        'PF_total_',
      );
      const { value } = await this.powerFactorLastValue({} as EntityModel);
      // const maskedValue =
      //   this.maskFunctionService.formatReadableNumber(value);
      const maskedValue = this.maskFunctionService.mask(
        value,
        MaskFunctionsEnum.FormatReadableNumber,
      ) as number;
      return unit ? `${maskedValue} ${unit}` : maskedValue.toString();
    } catch (error) {
      return NaN.toString();
    }
  }
  async fetchEnergyExportTotal() {
    try {
      const { value } = await this.energyExportTotalLastValue({
        entityTag: this.plantTag,
      } as EntityModel);
      return value;
    } catch (error) {
      console.error('Error fetching EnergyExportTotal', error);
      return NaN;
    }
  }
  async fetchEnergyImportTotal() {
    try {
      const { value } = await this.energyImportTodayLastValue({
        entityTag: this.plantTag,
      } as EntityModel);
      return value;
    } catch (error) {
      console.error('Error fetching EnergyExportTotal', error);
      return NaN;
    }
  }
  async fethPower(): Promise<ICurve> {
    try {
      const result = await this.powerAllValues(
        {} as EntityModel,
        {} as EntityField,
        DEFAULT_DATE_DETAILS,
      );
      return result;
    } catch (error) {
      console.error(
        `Error fetching ${this.plantTag} fleet Maanger Power`,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async fetchKpi(): Promise<IKPiInterface> {
    const { value: availability } = await this.availabilityLastValue({
      entityTag: this.plantTag,
    } as EntityModel);
    const { value: performance } = await this.performanceLastValue({
      entityTag: this.plantTag,
    } as EntityModel , {} as EntityField);
    return {
      PR: performance
        ? `${this.maskFunctionService.mask(
            performance,
            MaskFunctionsEnum.NumberStringToNFixedNumber,
          )}%`
        : NaN.toString(),
      AL: performance
        ? `${this.maskFunctionService.mask(
            availability,
            MaskFunctionsEnum.NumberStringToNFixedNumber,
          )}%`
        : NaN.toString(),
    };
  }

  async fetchPPCCData(): Promise<number> {
    try {
      const hvsEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      if (hvsEntities.length === 0) return NaN;
      const hvDevices = hvsEntities.map((item) => item.entityTag.split(':')[2]);
      const currentPowerQueries = hvDevices.map((entityTag) =>
        buildLatestDeviceFieldElasticQuery(entityTag, 'P_total2'),
      );
      const currentPowerResults = await Promise.all(
        currentPowerQueries.map((query) =>
          this.elasticService.search(this.plantIndex, query),
        ),
      );
      const DateTime = currentPowerResults[0].hits.hits[0]._source['DateTime'];
      if (!DateTime) return NaN;
      let power = 0;
      currentPowerResults.forEach((item) => {
        const hvPower = item.hits.hits[0]._source['P_total2'] ?? 0;
        power = power + hvPower;
      });
      return power;
    } catch (error) {
      console.error(`error in ${this.plantTag}: fetchPPCCData service `, error);
      return this.fleetServicesDefaultExport();
    }
  }
  async fetchPOAData(): Promise<number> {
    try {
      const { value } = await this.isolationTodayLastValue({} as EntityModel,{} as EntityField);
      return value;
    } catch (error) {
      return NaN;
    }
  }
  async fetchEnergyTodayData(): Promise<number> {
    try {
      const { value } = await this.energyExportTodayLastValue(
        {} as EntityModel,
      );
      return value;
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: fetchETodayData service `,
        error,
      );
      return this.fleetServicesDefaultExport();
    }
  }
  // async fetchMod(): Promise<number> {
  //   try {
  //     const { value } = await this.modLastValue({} as EntityModel);
  //     return value;
  //   } catch (error) {
  //     console.error(`error in ${this.plantTag}: fetchMod service `, error);
  //     return this.fleetServicesDefaultExport();
  //   }
  // }
  // async fetchMeteo() {
  //   try {
  //     const meteoWeatherStationQuery =
  //       buildLatestDeviceObjElasticQuery('Weather station');
  //     const meteoWeatherStation = await this.elasticService.search(
  //       this.plantIndex,
  //       meteoWeatherStationQuery,
  //     );
  //     const data = meteoWeatherStation.hits.hits[0]._source;
  //     const { value } = await this.modLastValue({} as EntityModel);
  //     const getValue = (firstKey: string, secondKey: string, unit: string) => {
  //       const val = data[firstKey] ?? data[secondKey];
  //       if (val === undefined || val === null || val === '') return NaN;
  //       return `${val} ${unit}`;
  //     };

  //     const meteoResponse = {
  //       WS: getValue('Wind_speed_(WSP)', 'Wind_speed__akt', 'm/s'),
  //       WD: getValue('Wind_direction_(WD)', 'Wind_direction_act', '°'),
  //       AMB: getValue('Ambient_temperature', 'Air_temperature_act', '°C'),
  //       PvRain: getValue('PV_Rain', 'Precipitation_intensive_', 'mm'),
  //       HMD: getValue('Relative_Humidity_Act', 'Relative_humidity_act', '%'),
  //       APress: getValue('Air_Pressure_Act', 'Absolute_air_pressure_act', 'pa'),
  //       PVT: `${value} °C`,
  //       GHI: '-',
  //     };
  //     return meteoResponse;
  //   } catch (error) {
  //     console.error(`error in ${this.plantTag}: fetchMeteo service `, error);
  //     return this.defaultMeteoServiceExport();
  //   }
  // }
  async fetchIsolationToday(): Promise<string> {
    try {
      const unit = 'kWh/㎡';
      const { value } = await this.isolationTodayLastValue({} as EntityModel,{} as EntityField);
      const maskedValue = this.maskFunctionService.mask(
        value,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
      return maskedValue ? `${maskedValue} ${unit}` : NaN.toString();
    } catch (error) {
      return NaN.toString();
    }
  }
  async fetchAmbientTemperature() {
    try {
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'Weather station',
        ['Air_temperature_act', 'Ambient_temperature'],
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const airTemp1 = result.hits.hits[0]._source['Air_temperature_act'];
      const airTemp2 = result.hits.hits[0]._source['Ambient_temperature'];
      const finalValue = airTemp1 ?? airTemp2 ?? NaN;
      return finalValue;
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: fetchAmbientTempature service `,
        error,
      );
      return NaN;
    }
  }
  async humidityLastValue(): Promise<IResponseLastValue> {
    const elasticQuery = buildLatestDeviceFieldElasticQuery(
      'Sub Temp',
      'Humidity',
    );
    const result = await this.elasticService.search(
      this.plantIndex,
      elasticQuery,
    );
    return {
      value: result.aggregations.last_value.hits.hits[0]._source.Humidity,
      Date: result.aggregations.last_value.hits.hits[0]._source.DateTime,
    };
  }
  //map
  async fetchMapData() {
    try {
      const plant = await this.plantService.fetchWithFleetByPlantId(
        this.plantId,
      );
      const statics = await this.entityFieldService.fetchStaticParameters(
        plant.uuid,
      );
      const nominalPower = statics.find(
        (item) => item.fieldTag === 'Nominal_Power',
      );
      const address = statics.find((item) => item.fieldTag === 'address');
      const phone = statics.find((item) => item.fieldTag === 'phone');
      const lat = statics.find((item) => item.fieldTag === 'lat');
      const long = statics.find((item) => item.fieldTag === 'long');
      const dataDelay = statics.find((item) => item.fieldTag === 'Data_Delay');

      const { value: performance } = await this.performanceLastValue(plant , {} as EntityField);
      const { value: availability } = await this.availabilityLastValue(plant);
      const { value: energyToday } =
        await this.energyExportTodayLastValue(plant);
      const { value: energyTotal } =
        await this.energyExportTotalLastValue(plant);
      return {
        plant,
        nominalPower,
        address,
        phone,
        lat,
        long,
        dataDelay,
        performance,
        availability,
        energyToday,
        energyTotal,
      };
    } catch (error) {
      console.error('Error fetching PowerFactor', error);
      return {};
    }
  }
  async fetchFullTreeData() {
    const sources = await this.sourceService.readByPlantId(this.plantId);
    const entities =
      await this.entityService.getPlantEntitiesWithSpecificEntityTypeTag(
        this.plantId,
        ['Inverter', 'PCC_Section', 'SmartLogger', 'Plant'],
      );
    const elasticQuery = buildJarghoyeh2TreeLastValueQuery();
    const response = await this.elasticService.search(
      this.plantIndex,
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
                this.plantTag
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
          await this.substationPerformanceLastValue(substation , {} as EntityField);
        const { value: subEnergyLossLess } =
          await this.substaionRawProductionEnergyLastValue(substation);
        const DIState = await this.stateService.fetchActiveState(
          this.plantTag,
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
    const { value: performance, Date } = await this.performanceLastValue(plant,{} as EntityField);
    const { value: power } = await this.powerLastValue(plant,{} as EntityField);
    const { value: energyToday } = await this.energyExportTodayLastValue(plant);
    const meterStatus = await this.statusService.fetchMetersStatus(
      this.plantTag,
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

  @Cacheable('1m')
  private async stringPowerElasticResult(
    plantIndex: string,
    entityTag: string,
    funcType: EntityFieldPeriodFunctionEnum,
    rangeType: RangeTypeEnum,
    rangeValue: number,
    fieldTags: string[],
  ) {
    const [, substation, deviceName] = entityTag.split(':');
    const key = await this.sourceService.mapSubToKeyWithSources(
      this.plantId,
      substation,
    );
    const logWithPrefix = `*${key}*`;
    const aggs = fieldTags.reduce<Record<string, any>>((acc, field) => {
      acc[field] = { [funcType]: { field } };
      return acc;
    }, {});
    const elasticQuery = {
      size: 0,
      _source: false,
      query: {
        bool: {
          must: [
            { match: { 'DeviceName.keyword': deviceName } },
            { wildcard: { 'log.file.path.keyword': logWithPrefix } },
            {
              range: {
                DateTime: {
                  gte: `now-${rangeValue}${rangeType}`,
                  lte: 'now',
                  time_zone: 'Asia/Tehran',
                },
              },
            },
          ],
        },
      },
      aggs,
    };
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    return response.aggregations ?? null;
  }
  async plantActiveDuration(): Promise<IResponseStringsLastValue> {
    const elasticQuery = {
      size: 0,
      _source: ['DeviceName', 'P_total', 'DateTime'],
      query: {
        bool: {
          must: [
            {
              range: {
                DateTime: {
                  gte: 'now/d', // start of the current day at 00:00
                  lte: 'now', // current time
                  time_zone: '+03:30', // optional — adjust to your local timezone
                },
              },
            },
          ],
          should: [
            {
              bool: {
                must: [
                  {
                    term: {
                      'DeviceName.keyword': 'HV1 POWER METER OUT 1',
                    },
                  },
                  {
                    range: {
                      P_total: {
                        lt: 0,
                      },
                    },
                  },
                ],
              },
            },
            {
              bool: {
                must: [
                  {
                    term: {
                      'DeviceName.keyword': 'HV1 POWER METER OUT 2',
                    },
                  },
                  {
                    range: {
                      P_total: {
                        lt: 0,
                      },
                    },
                  },
                ],
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      aggs: {
        per_day_average: {
          date_histogram: {
            field: 'DateTime',
            fixed_interval: '1d',
            format: "yyyy-MM-dd'T'HH:mm:ss.SSSZZ",
            time_zone: 'Asia/Tehran',
          },
          aggs: {
            min_time: {
              min: {
                field: 'DateTime',
              },
            },
            max_time: {
              max: {
                field: 'DateTime',
              },
            },
          },
        },
      },
    };
    const result = await this.elasticService.search(
      this.plantIndex,
      elasticQuery,
    );
    const maxTime =
      result.aggregations?.per_day_average?.buckets[0]?.max_time?.value;
    const minTime =
      result.aggregations?.per_day_average?.buckets[0]?.min_time?.value;
    if (maxTime === undefined || minTime === undefined)
      return this.lastValueServicesDefaultExport();
    const duration = maxTime - minTime;
    const stringHour = msToTime(duration);
    return {
      value: stringHour,
      Date: getFormattedDateTime(),
    };
  }
  async acBasicPerformanceLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ) {
    try {
      const isInTheDayResult = await this.plantService.isInTheDay(this.plantId);
      if (!isInTheDayResult)
        return {
          lastValue: 0,
          Date: getFormattedDateTime(),
        };
      const { installedPower: plantEnergy } =
        await this.plantService.resolvePlantEnergy(this.plantId);
      const { value: plantAcEnergy } = await this.powerLastValue(
        {} as EntityModel,{} as EntityField
      );
      let performance = 0;
      if (plantAcEnergy > 0) {
        performance = (plantAcEnergy * 100000) / plantEnergy;
      }
      return {
        lastValue: performance,
        Date: new Date(),
      };
    } catch (err) {
      console.log(err);
      return {
        lastValue: 0,
        Date: Date.now(),
      };
    }
  }
  async acBasicPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const { installedPower: plantAcEnergy } =
        await this.plantService.resolvePlantEnergy(this.plantId);
      const hvEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const hvDeviceNames = hvEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      const condition = hvDeviceNames
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const script = `
    if (${condition}) {
      if (doc['P_total'].size() > 0 && doc['P_total'].value < 0) {
        return Math.abs(doc['P_total'].value);
      }
    }
    return null;
    `.trim();
      const body = {
        size: 0,
        _source: ['P_total', 'DateTime'],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': hvDeviceNames,
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
              max_abs_ptotal: {
                avg: {
                  script: {
                    source: script,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plantIndex, body);
      const mapped: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item) => {
          const performance =
            (item.max_abs_ptotal.value * 100000) / plantAcEnergy;
          return {
            DateTime: item.key_as_string,
            value: performance,
          };
        });
      return this.curveService.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: acBasicPerformanceAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async acRawPerformanceLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ) {
    try {
      const isInTheDayResult = await this.plantService.isInTheDay(this.plantId);
      if (!isInTheDayResult)
        return {
          lastValue: 0,
          Date: getFormattedDateTime(),
        };
      const { minIrradianceToCalculatePerformance } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const { installedPower: plantEnergy } =
        await this.plantService.resolvePlantEnergy(this.plantId);
      const { value: power } = await this.powerLastValue({} as EntityModel,{} as EntityField);
      const { value: irradiance } = await this.irradiationLastValue(
        {} as EntityModel,{} as EntityField
      );
      let performance = 0;
      if (power > 0 && irradiance > minIrradianceToCalculatePerformance) {
        performance = (power * 100000000) / (plantEnergy * irradiance);
      }
      return {
        lastValue: performance,
        Date: getFormattedDateTime(),
      };
    } catch (err) {
      console.error(
        `error in ${this.plantTag}: acRawPerformanceLastValue service `,
        err,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async acRawPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { minIrradianceToCalculatePerformance } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const should = await this.dayLightService.generateShouldClause(
        this.plantTag,
        dateDetails,
      );
      const { range, date_histogram } = setTimeRange(dateDetails);
      const irradiationEntities =
        await this.plantService.fetchPlantIrradiationDevices(this.plantId);
      const irradiationDevice = irradiationEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      const hvEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const hvDevice = hvEntities.map((item) => item.entityTag.split(':')[2]);
      const irradiationElasticScriptCondition = irradiationDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const irradiationElasticScript = `
if (${irradiationElasticScriptCondition}) {
  if (
    doc['${this.irradiationParameter}'].size() > 0 &&
    doc['${this.irradiationParameter}'].value > 0
  ) {
    return doc['${this.irradiationParameter}'].value;
  }
}
return null;
`.trim();

      const powerElasticScriptCondition = hvDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const powerElasticScript = `
if (${powerElasticScriptCondition}) {
  if (doc['P_total'].size() > 0 && doc['P_total'].value < 0) {
    return Math.abs(doc['P_total'].value);
  }
}
return null;
`.trim();
      const { installedPower: plantACPower } =
        await this.plantService.resolvePlantEnergy(this.plantId);
      const body = {
        size: 0,
        _source: [this.irradiationParameter, 'P_total', 'DateTime'],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': [...hvDevice, ...irradiationDevice],
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
              max_irradiance: {
                avg: {
                  script: {
                    source: irradiationElasticScript,
                  },
                },
              },
              max_abs_ptotal: {
                avg: {
                  script: {
                    source: powerElasticScript,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plantIndex, body);
      let mapped: IMappedAllValueResult = [];
      response.aggregations.intervals.buckets.map((item) => {
        if (item.max_irradiance?.value > minIrradianceToCalculatePerformance) {
          const performance =
            (item.max_abs_ptotal.value * 100000) /
            ((plantACPower * item?.max_irradiance?.value) / 1000);
          mapped.push({
            value: performance,
            DateTime: item.key_as_string,
          });
        }
      });
      return this.curveService.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: acRawPerformanceAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async acCorrectPerformanceLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ) {
    try {
      const isInTheDayResult = await this.plantService.isInTheDay(this.plantId);
      if (!isInTheDayResult)
        return {
          lastValue: 0,
          Date: getFormattedDateTime(),
        };
      const { minIrradianceToCalculatePerformance, alphaFactor } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const { installedPower: plantEnergy } =
        await this.plantService.resolvePlantEnergy(this.plantId);
      const { value: power } = await this.powerLastValue({} as EntityModel,{} as EntityField);
      const { value: irradiance } = await this.irradiationLastValue(
        {} as EntityModel,{} as EntityField
      );
      const { value: mod } = await this.modLastValue(
        {} as EntityModel,
        {} as EntityField,
      );
      let performance = 0;
      if (power > 0 && irradiance > minIrradianceToCalculatePerformance) {
        performance =
          (power * 100000000) /
          (plantEnergy * irradiance * (1 + alphaFactor * (mod - 25)));
      }

      return {
        lastValue: performance,
        Date: getFormattedDateTime(),
      };
    } catch (err) {
      console.error(
        `error in ${this.plantTag}: acCorrectPerformanceLastValue service `,
        err,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async acCorrectPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const mvDevice = [entity.entityTag.split(":")[2]]
      const { minIrradianceToCalculatePerformance, alphaFactor } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const should = await this.dayLightService.generateShouldClause(
        this.plantTag,
        dateDetails,
      );
      const { range, date_histogram } = setTimeRange(dateDetails);
      const irradiationEntities =
        await this.plantService.fetchPlantIrradiationDevices(this.plantId);
      const mods = await this.modAllValues(
        {} as EntityModel,
        {} as EntityField,
        dateDetails,
      );
      const irradiationDevice = irradiationEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      const irradiationElasticScriptCondition = irradiationDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const irradiationElasticScript = `
if (${irradiationElasticScriptCondition}) {
  if (
    doc['${this.irradiationParameter}'].size() > 0 &&
    doc['${this.irradiationParameter}'].value > 0
  ) {
    return doc['${this.irradiationParameter}'].value;
  }
}
return null;
`.trim();

      const powerElasticScriptCondition = mvDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const powerElasticScript = `
if (${powerElasticScriptCondition}) {
  if (doc['P_total'].size() > 0 && doc['P_total'].value < 0) {
    return Math.abs(doc['P_total'].value);
  }
}
return null;
`.trim();
      const { installedPower: plantACPower } =
        await this.plantService.resolvePlantEnergy(this.plantId);
      const body = {
        size: 0,
        _source: [this.irradiationParameter, 'P_total', 'DateTime'],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': [...mvDevice, ...irradiationDevice],
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
              max_irradiance: {
                avg: {
                  script: {
                    source: irradiationElasticScript,
                  },
                },
              },
              max_abs_ptotal: {
                avg: {
                  script: {
                    source: powerElasticScript,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plantIndex, body);
      let mapped: IMappedAllValueResult = [];
      mods.forEach((item) => {
        const result = response.aggregations.intervals.buckets.find(
          (obj) => obj.key_as_string === item.FullDate,
        );
        if (
          result?.max_irradiance?.value > minIrradianceToCalculatePerformance
        ) {
          const performance =
            (result.max_abs_ptotal.value * 100000000) /
            (plantACPower *
              result?.max_irradiance?.value *
              (1 + alphaFactor * ((item.AvgValue as number) - 25)));
          mapped.push({
            DateTime: item.FullDate,
            value: performance,
          });
        }
      });
      return this.curveService.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: acCorrectPerformanceAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async acRatioCorrectPerformanceAllValues(
      entity: EntityModel,
        entityField: EntityField,
        dateDetails: IDateDetails,
  )  {
    try {
      const { mode } = dateDetails;
      if (mode === 'C' || mode === 'default' || mode === 'D') return [];
      const {annualPerformanceDecreasePercent , commissioningYear} = await this.plantService.resolvePlantPerformanceRatioCredential(this.plantId);
      const lost = annualPerformanceDecreasePercent * commissioningYear
      const performance = await this.acCorrectPerformanceAllValues(entity, entityField , dateDetails);
      const mapped:IMappedAllValueResult = performance.map(item => {
        return {
          value : item.AvgValue as number - lost,
          DateTime : item.FullDate
        }
    })
    return this.curveService.buildCurveWithOneValue(mapped)
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  }
  async acRatioRawPerformanceAllValues(
      entity: EntityModel,
        entityField: EntityField,
        dateDetails: IDateDetails,
  )  {
    try {
      const { mode } = dateDetails;
      if (mode === 'C' || mode === 'default' || mode === 'D') return [];
      const {annualPerformanceDecreasePercent , commissioningYear} = await this.plantService.resolvePlantPerformanceRatioCredential(this.plantId);
      const lost = annualPerformanceDecreasePercent * commissioningYear
      const performance = await this.acRawPerformanceAllValues(entity, entityField , dateDetails);
      const mapped:IMappedAllValueResult = performance.map(item => {
        return {
          value : item.AvgValue as number - lost,
          DateTime : item.FullDate
        }
    })
    return this.curveService.buildCurveWithOneValue(mapped)
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  }
  async acRatioBasicPerformanceAllValues(
      entity: EntityModel,
        entityField: EntityField,
        dateDetails: IDateDetails,
  ) {
    try {
      const { mode } = dateDetails;
      if (mode === 'C' || mode === 'default' || mode === 'D') return [];
      const {annualPerformanceDecreasePercent , commissioningYear} = await this.plantService.resolvePlantPerformanceRatioCredential(this.plantId);
      const lost = annualPerformanceDecreasePercent * commissioningYear
      const performance = await this.acBasicPerformanceAllValues(entity, entityField , dateDetails);
      const mapped:IMappedAllValueResult = performance.map(item => {
        return {
          value : item.AvgValue as number - lost,
          DateTime : item.FullDate
        }
    })
    return this.curveService.buildCurveWithOneValue(mapped)
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  }

  async performanceIndexLastValue(entity: EntityModel,entityField: EntityField,):Promise<IResponseLastValue> {
  try {
    const { value: insolation } = await this.isolationTodayLastValue(entity , entityField);
    const { value: irradiance } = await this.irradiationLastValue(entity , entityField);
    const { value: power } = await this.powerLastValue({} as EntityModel,{} as EntityField);
    const { installedPower: plantEnergy } = await this.plantService.resolvePlantEnergy(this.plantId);
    const { minIrradianceToCalculatePerformance } = await this.plantService.resolvePlantPerformanceLimit(this.plantId)

    if (isNaN(insolation) || isNaN(irradiance) || isNaN(power))
      return {
        value: 0,
        Date: getFormattedDateTime(),
      };
    if (irradiance < minIrradianceToCalculatePerformance)
      return {
        value: 0,
        Date: getFormattedDateTime(),
      };

    const performance = (power * irradiance * 100) / (plantEnergy * insolation);
    return {
      value: performance,
      Date: getFormattedDateTime(),
    };
  } catch (err) {
    console.log(`error in ${this.plantTag}: performanceIndexLastValue service `,);
   return this.lastValueServicesDefaultExport()
  }
  }
  async performanceIndexAllValues(
          entity: EntityModel,
          entityField: EntityField,
          dateDetails: IDateDetails,
  ) {
    try {
      const { installedPower: plantEnergy } = await this.plantService.resolvePlantEnergy(this.plantId);
      const powers = await this.powerAllValues(entity,entityField,dateDetails);
      const irradiations = await this.irradiationDailyAllValues(
        entity,
          entityField,
          dateDetails,
      );
      const insolations = await this.isolationTodayAllValues(
        entity,
          entityField,
          dateDetails,
      );
      const mapped:IMappedAllValueResult = [];
      irradiations.forEach((item) => {
        const insolation = insolations.find((obj) => obj.FullDate === item.FullDate);
        const power = powers.find((obj) => obj.FullDate === item.FullDate);
        if (insolation && insolation.AvgValue > 0) {
          const performance = ((power.AvgValue as number) * (item.AvgValue as number)) / (plantEnergy * (insolation.AvgValue as number));
          mapped.push({
            DateTime : item.FullDate,
            value :performance
          }
          );
        }
      });
      return this.curveService.buildCurveWithOneValue(mapped , MaskFunctionsEnum.MultiplyByThousand)
    } catch (error) {
      console.error(
          `error in ${this.plantTag}: substationAcBasicPerformanceLastValue service `,
          error,
        );
        return this.allValueServicesDefaultExport();
    }
  }


  async substationAcBasicPerformanceLastValue(
   entity: EntityModel,
    entityField: EntityField,
) {
  try {
     const isInTheDayResult = await this.plantService.isInTheDay(this.plantId);
      if (!isInTheDayResult)
        return {
          lastValue: 0,
          Date: getFormattedDateTime(),
        };
    const { substationDcEnergy: substationEnergy } = await this.plantService.resolveSubstationEnergy(this.plantId);
    const power = await this.fetchMvPower(entity)
    if (!power)
      return this.lastValueServicesDefaultExport()

    let performance = 0;
    if (power > 0) {
      performance = (power * 100000) / substationEnergy;
    }
    const masked = this.maskFunctionService.mask(performance , MaskFunctionsEnum.NumberStringToNFixedNumber)
    return {
      value: masked,
      DateTime: getFormattedDateTime(),
    };
  } catch (error) {
      console.error(
        `error in ${this.plantTag}: substationAcBasicPerformanceLastValue service `,
        error,
      );
      return this.allValueServicesDefaultExport();
  }
  }
  async substationAcBasicPerformanceAllValues(
      entity: EntityModel,
      entityField: EntityField,
      dateDetails: IDateDetails,
  ) {
    try {
      const [, substation, device] = entity.entityTag.split(':');
      const { range, date_histogram } = setTimeRange(dateDetails);
      const { substationDcEnergy: plantEnergy } = await this.plantService.resolveSubstationEnergy(this.plantId);
      const body = {
        size: 0,
        _source: [this.irradiationParameter, 'P_total', 'DateTime'],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': ['Irradiation', device],
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
              max_abs_ptotal: {
                avg: {
                  script: {
                    source: `if (doc['DeviceName.keyword'].value == '${device}') { if (doc['P_total'].size() > 0 && doc['P_total'].value<0) { return Math.abs(doc['P_total'].value); } } return null;`,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plantIndex , body)
      const mapped:IMappedAllValueResult = [];
      response.aggregations.intervals.buckets.forEach((item) => {
        const performance = (item.max_abs_ptotal.value * 100000) / plantEnergy;
        mapped.push({
          value : performance,
          DateTime : item.key_as_string
        })
      });
      return this.curveService.buildCurveWithOneValue(mapped , MaskFunctionsEnum.NumberStringToNFixedNumber);
    } catch (error) {
            console.error(
          `error in ${this.plantTag}: substationAcBasicPerformanceAllValues service `,
          error,
        );
        return this.allValueServicesDefaultExport();
    }
  }
  async substationAcRawPerformanceLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ) {
    try {
      const isInTheDayResult = await this.plantService.isInTheDay(this.plantId);
      if (!isInTheDayResult)
        return {
          lastValue: 0,
          Date: getFormattedDateTime(),
        };
      const { minIrradianceToCalculatePerformance } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const { substationDcEnergy: substationEnergy } =
        await this.plantService.resolveSubstationEnergy(this.plantId);
      const power = await this.fetchMvPower(entity);
      const { value: irradiance } = await this.irradiationLastValue(
        {} as EntityModel,{} as EntityField
      );
      let performance = 0;
      if (power < 0 && irradiance > minIrradianceToCalculatePerformance) {
        performance =(-power * 100000000) / (substationEnergy * irradiance); 
      }
      return {
        lastValue: performance,
        Date: getFormattedDateTime(),
      };
    } catch (err) {
       console.error(
        `error in ${this.plantTag}: substationAcCorrectPerformanceLastValue service `,
        err,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async substationAcRawPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { minIrradianceToCalculatePerformance } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const should = await this.dayLightService.generateShouldClause(
        this.plantTag,
        dateDetails,
      );
      const [, substation, device] = entity.entityTag.split(':');
      const { range, date_histogram } = setTimeRange(dateDetails);
      const { substationDcEnergy: substationEnergy } =
        await this.plantService.resolveSubstationEnergy(this.plantId);
      const irradiationEntities =
        await this.plantService.fetchPlantIrradiationDevices(this.plantId);
      const irradiationDevice = irradiationEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      const mvDevice = [device];
      const irradiationElasticScriptCondition = irradiationDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const irradiationElasticScript = `
if (${irradiationElasticScriptCondition}) {
  if (
    doc['${this.irradiationParameter}'].size() > 0 &&
    doc['${this.irradiationParameter}'].value > 0
  ) {
    return doc['${this.irradiationParameter}'].value;
  }
}
return null;
`.trim();

      const powerElasticScriptCondition = mvDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const powerElasticScript = `
if (${powerElasticScriptCondition}) {
  if (doc['P_total'].size() > 0 && doc['P_total'].value < 0) {
    return Math.abs(doc['P_total'].value);
  }
}
return null;
`.trim();
      const body = {
        size: 0,
        _source: [this.irradiationParameter, 'P_total', 'DateTime'],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': [...irradiationDevice, ...mvDevice],
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
              max_irradiance: {
                avg: {
                  script: {
                    source: irradiationElasticScript,
                  },
                },
              },
              max_abs_ptotal: {
                avg: {
                  script: {
                    source: powerElasticScript,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plantIndex, body);
      const mapped: IMappedAllValueResult = [];
        response.aggregations.intervals.buckets.forEach((item) => {
      if (item.max_irradiance?.value > minIrradianceToCalculatePerformance) {
        const performance =
          (item.max_abs_ptotal.value * 100000000) / (substationEnergy * item?.max_irradiance?.value);
        mapped.push(
          {
            DateTime : item.key_as_string,
            value : performance
          }
        );
      }
    });
      return this.curveService.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
    } catch (error) {
       console.error(
        `error in ${this.plantTag}: substationAcRawPerformanceAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async substationAcCorrectPerformanceLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ) {
    try {
      const isInTheDayResult = await this.plantService.isInTheDay(this.plantId);
      if (!isInTheDayResult)
        return {
          lastValue: 0,
          Date: getFormattedDateTime(),
        };
      const { minIrradianceToCalculatePerformance, alphaFactor } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const { substationDcEnergy: substationEnergy } =
        await this.plantService.resolveSubstationEnergy(this.plantId);
      const power = await this.fetchMvPower(entity);
      const { value: irradiance } = await this.irradiationLastValue(
        {} as EntityModel,{} as EntityField
      );
      const { value: mod } = await this.modLastValue(
        {} as EntityModel,
        {} as EntityField,
      );
      let performance = 0;
      if (power > 0 && irradiance > minIrradianceToCalculatePerformance) {
        performance =
          (power * 100000000) /
          (substationEnergy * irradiance * (1 + alphaFactor * (mod - 25)));
      }
      return {
        lastValue: performance,
        Date: getFormattedDateTime(),
      };
    } catch (err) {
       console.error(
        `error in ${this.plantTag}: substationAcCorrectPerformanceLastValue service `,
        err,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async substationAcCorrectPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { minIrradianceToCalculatePerformance, alphaFactor } =
        await this.plantService.resolvePlantPerformanceLimit(this.plantId);
      const should = await this.dayLightService.generateShouldClause(
        this.plantTag,
        dateDetails,
      );
      const mods = await this.modAllValues(
        {} as EntityModel,
        {} as EntityField,
        dateDetails,
      );
      const [, substation, device] = entity.entityTag.split(':');
      const { range, date_histogram } = setTimeRange(dateDetails);
      const { substationDcEnergy: substationEnergy } =
        await this.plantService.resolveSubstationEnergy(this.plantId);
      const irradiationEntities =
        await this.plantService.fetchPlantIrradiationDevices(this.plantId);
      const irradiationDevice = irradiationEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      const mvDevice = [device];
      const irradiationElasticScriptCondition = irradiationDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const irradiationElasticScript = `
if (${irradiationElasticScriptCondition}) {
  if (
    doc['${this.irradiationParameter}'].size() > 0 &&
    doc['${this.irradiationParameter}'].value > 0
  ) {
    return doc['${this.irradiationParameter}'].value;
  }
}
return null;
`.trim();

      const powerElasticScriptCondition = mvDevice
        .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
        .join(' || ');

      const powerElasticScript = `
if (${powerElasticScriptCondition}) {
  if (doc['P_total'].size() > 0 && doc['P_total'].value < 0) {
    return Math.abs(doc['P_total'].value);
  }
}
return null;
`.trim();
      const body = {
        size: 0,
        _source: [this.irradiationParameter, 'P_total', 'DateTime'],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': [...irradiationDevice, ...mvDevice],
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
              max_irradiance: {
                avg: {
                  script: {
                    source: irradiationElasticScript,
                  },
                },
              },
              max_abs_ptotal: {
                avg: {
                  script: {
                    source: powerElasticScript,
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(this.plantIndex, body);
      const mapped: IMappedAllValueResult = [];
      mods.forEach((item) => {
        const result = response.aggregations.intervals.buckets.find(
          (obj) => obj.key_as_string === item.FullDate,
        );
        if (
          result &&
          result?.max_irradiance?.value > minIrradianceToCalculatePerformance
        ) {
          const performance =
            (result.max_abs_ptotal.value * 100000000) /
            (substationEnergy *
              result.max_irradiance.value *
              (1 + alphaFactor * ((item.AvgValue as number) - 25)));

          mapped.push({
            DateTime: item.FullDate,
            value: performance,
          });
        }
      });
      return this.curveService.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
    } catch (error) {
        console.error(
        `error in ${this.plantTag}: substationAcCorrectPerformanceAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async resolvePlantWorkdaySchedule() {
    try {
      const hvEntities = await this.plantService.fetchPlantHvEntity(
        this.plantId,
      );
      const hvDeviceNames = hvEntities.map((item) => item.entityTag);
      const elasticQuery = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': hvDeviceNames,
                },
              },
              {
                range: {
                  P_total: { lt: 0 },
                },
              },
              {
                range: {
                  DateTime: {
                    gte: 'now/d',
                    lte: 'now',
                    time_zone: '+03:30',
                  },
                },
              },
            ],
          },
        },
        aggs: {
          first_negative_time: {
            min: { field: 'DateTime' },
          },
          last_negative_time: {
            max: { field: 'DateTime' },
          },
        },
      };

      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const start = result.aggregations.first_negative_time.value_as_string;
      const end = result.aggregations.last_negative_time.value_as_string;

      if (!start) return { start: null, end: null, diffHours: null };

      const startDate = new Date(start);
      const endDate = new Date(end);

      const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
      const diffHours = diffMs / (1000 * 60 * 60);

      return { start, end, diffHours };
    } catch (error) {
      console.log(error);
      return { start: null, end: null, diffHours: null };
    }
  }
  async fetchMvPower(entity:EntityModel){
    try {
      const [,substation , device] = entity.entityTag.split(":")
   const elasticQuery = buildLatestDeviceFieldElasticQuery(device , 'P_total');
    const result = await this.elasticService.search(this.plantIndex , elasticQuery)
    console.log({result});
    
    const power = result.hits.hits[0]._source['P_total']
    return power 
    } catch (error) {
      console.log(error);
      return null
    }
  }
  // async fetchFullTreeData() {
  //   const sources = await this.sourceService.readByPlantId(
  //       this.plantId,
  //   );
  //   const entities =
  //     await this.entityService.getPlantEntitiesWithSpecificEntityTypeTag(
  //       this.plantId,
  //       ['Inverter', 'PCC_Section', 'SmartLogger', 'Plant']
  //     );
  //   const elasticQuery = buildJarghoyeh2TreeLastValueQuery();
  //   const response = await this.elasticService.search(
  //     this.plantIndex,
  //     elasticQuery
  //   );
  //   const result = response.aggregations.by_sub.buckets
  //     .map((subBucket: any) => {
  //       return subBucket.by_device.buckets.map((deviceBucket: any) => {
  //         return deviceBucket.latest_record.hits.hits.map((data: any) => {
  //           const {
  //             Insulation_resistance: insulationResistance,
  //             Internal_temperature: internalTemperature,
  //             Efficiency: performance,
  //             DateTime,
  //           } = data._source;
  //           return {
  //             deviceTag: `${
  //               this.plantTag
  //             }:${this.sourceService.mapkeyToSubWithSources(
  //               sources,
  //               subBucket.key
  //             )}:${deviceBucket.key}`,
  //             DateTime,
  //             performance,
  //             insulationResistance,
  //             internalTemperature,
  //           };
  //         });
  //       });
  //     })
  //     .flat()
  //     .flat();

  //   const inverterEntities = entities.filter(
  //     (item) => item.entityType.tag == 'Inverter'
  //   );
  //   const inverterTreeResult = inverterEntities.map((inverter: EntityModel) => {
  //     const elasticResultObj = result.find((obj: any) => obj.deviceTag);
  //     const { deviceTag, ...rest } = elasticResultObj;
  //     delete elasticResultObj.deviceTag;
  //     return {
  //       ...inverter,
  //       ...rest,
  //     };
  //   });
  //   const substationEntities = entities.filter(
  //     (item) => item.entityType.tag == 'SmartLogger'
  //   );
  //   const substationResult = await Promise.all(
  //     substationEntities.map(async (substation: EntityModel) => {
  //       const { value: performance, Date: DateTime } =
  //         await this.substationPerformanceLastValue(substation);
  //       const { value: subEnergyLossLess } =
  //         await this.substaionRawProductionEnergyLastValue(substation);
  //       const DIState = await this.stateService.fetchActiveState(
  //         this.plantTag,
  //         substation.entityTag,
  //         'DI status'
  //       );

  //       return {
  //         ...substation,
  //         DateTime,
  //         performance,
  //         production_energy: subEnergyLossLess,
  //         DIState: DIState ? DIState.state_str : null,
  //       };
  //     })
  //   );
  //   const pccEntities = entities.find(
  //     (item) => item.entityType.tag === 'PCC_Section'
  //   );
  //   const plant = entities.find((item) => item.entityType.tag === 'Plant');
  //   if (!plant) throw new InternalServerErrorException('something goes wrong');
  //   const { value: performance, Date } = await this.performanceLastValue(plant);
  //   const { value: power } = await this.powerLastValue(plant);
  //   const { value: energyToday } = await this.energyExportTodayLastValue(plant);
  //   const meterStatus = await this.statusService.fetchMetersStatus(
  //     this.plantTag
  //   );
  //   const pccTreeResult = [
  //     {
  //       ...pccEntities,
  //       DateTime: Date,
  //       performance,
  //       power,
  //       energyToday,
  //       meterStatus,
  //     },
  //   ];
  //   const allTreeResult = [
  //     ...pccTreeResult,
  //     ...substationResult,
  //     ...inverterTreeResult,
  //   ];
  //   return allTreeResult;
  // }
}
