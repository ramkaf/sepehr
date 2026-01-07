import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
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
  buildLosslessSubstationEnergyQuery,
  buildLatestDeviceObjElasticQuery,
  buildSantralPlantPerformanceAllValueQuery,
} from 'libs/database';
import {
  IDateDetails,
  IKPiInterface,
  IMappedAllValueResult,
  PeriodEnum,
} from 'libs/interfaces';
import {
  getFormattedDateTime,
  getHourlyDifference,
  getNestedValue,
  getWeatherFieldElasticPath,
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
import { MaskFunctionsEnum } from 'libs/enums';
import { EnergyService } from '../../power-plant-custom-services/energy.service';
import { IMeteo } from '../../interfaces/meteo.interface';
import { MaskFunctionService } from '../mask-functions/mask-function.service';
import { BasePlantService } from './base-plant.service';
import { PlantDayLightService } from '../day-light/day-light.service';

@Injectable()
export abstract class SantralPlantService extends BasePlantService {
  constructor(
    protected readonly plantId: number,
    protected readonly plantTag: string,
    protected readonly plantIndex: string,
    protected readonly irradiationParameter: string,
    protected readonly powerFactorParameter: string,
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

  async powerLastValue(entity: EntityModel): Promise<IResponseLastValue> {
    try {
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'ION METER',
        'kW_tot',
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const DateTime = result.hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      const value = result.hits.hits[0]._source['kW_tot'];
      const maskedValue = this.maskFunctionService.mask(value, [
        MaskFunctionsEnum.ReLUReverse,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]) as number;
      return {
        value: maskedValue,
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
    try {
      const device = 'ION METER';
      const query = buildPowerAllValueQuery(
        device,
        'kW_tot',
        date_histogram,
        range,
        true,
      );
      const result = await this.elasticService.search(this.plantIndex, query);
      const mappedResult: IMappedAllValueResult =
        result.aggregations.power_over_time.buckets.map((item: any) => {
          return {
            DateTime: item.key_as_string,
            value: item.aggs.value ?? 0,
          };
        });
      return this.curveService.buildCurveWithOneValue(mappedResult, [
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
      const device = 'ION METER';
      const currentIonEnergyQuery = buildLatestDeviceFieldElasticQuery(
        device,
        'kWh_rec',
      );
      const currentIonEnergyResult = await this.elasticService.search(
        this.plantIndex,
        currentIonEnergyQuery,
      );
      const currentIonEnergy =
        currentIonEnergyResult.hits.hits[0]._source['kWh_rec'];
      const Date = currentIonEnergyResult.hits.hits[0]._source['DateTime'];
      if (!currentIonEnergy) return this.lastValueServicesDefaultExport();
      const midnightIonEnergyQuery = buildMidnightDeviceFieldQuery(
        device,
        'kWh_rec',
      );
      const midnightIonEnergyResult = await this.elasticService.search(
        this.plantIndex,
        midnightIonEnergyQuery,
      );
      const midnightIonEnergy =
        midnightIonEnergyResult.hits.hits[0]._source['kWh_rec'];
      const energyImportToday = currentIonEnergy - midnightIonEnergy;
      const maskedValue = this.maskFunctionService.mask(energyImportToday, [
        MaskFunctionsEnum.MultiplyByThousand,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
      if (typeof maskedValue === 'string')
        throw new BadRequestException('something goes wrong');

      return {
        value: maskedValue,
        Date,
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
        M: this.energyService.fetchSantralEnergyTodayAllValueMonthly,
        D: this.energyService.fetchSantralEnergyTodayAllValueDaily,
        Y: this.energyService.fetchSantralEnergyTodayAllValueYearly,
        C: this.energyService.fetchSantralEnergyTodayAllValueCustom,
        default: this.energyService.fetchSantralEnergyTodayAllValueCustom,
      };

      const fetchFn = fetchMap[mode] || fetchMap.default;
      const result = await fetchFn.call(
        this.energyService,
        this.plantIndex,
        dateDetails,
        'kWh_rec',
      );

      return this.curveService.buildCurveWithOneValue(
        result,
        entityField.maskFunction,
      );
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
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'ION METER',
        'kWh_rec',
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const DateTime = result.hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      const energyImport = result.hits.hits[0]._source['kWh_rec'];
      const maskedValue = this.maskFunctionService.mask(energyImport, [
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]) as number;
      return {
        value: maskedValue,
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
  async energyImportTotalAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const parameter = 'kWh_rec';
      const device = 'ION METER';
      const elasticQuery = buildDeviceParameterAllValueQuery(
        device,
        parameter,
        date_histogram,
        range,
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const mappedResult = result.aggregations.parameter_over_time.buckets.map(
        (item: any) => ({
          DateTime: item.key_as_string,
          value: item.param?.value || 0,
        }),
      );

      return this.curveService.buildCurveWithOneValue(mappedResult, [
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
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
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'ION METER',
        'kWh_del',
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const DateTime = result.hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      const energyImport = result.hits.hits[0]._source['kWh_del'];
      const maskedValue = this.maskFunctionService.mask(energyImport, [
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]) as number;
      return {
        value: maskedValue,
        Date: DateTime,
      };
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyExportTotalLastValue service `,
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
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const parameter = 'kWh_del';
      const device = 'ION METER';
      const elasticQuery = buildDeviceParameterAllValueQuery(
        device,
        parameter,
        date_histogram,
        range,
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const mappedResult = result.aggregations.parameter_over_time.buckets.map(
        (item: any) => ({
          DateTime: item.key_as_string,
          value: item.param?.value || 0,
        }),
      );

      return this.curveService.buildCurveWithOneValue(mappedResult, [
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
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
    const deviceName = 'ION METER';
    try {
      const currentEnergyQuery = buildLatestDeviceFieldElasticQuery(
        deviceName,
        'kWh_del',
      );
      const midnightEnergyQuery = buildMidnightDeviceFieldQuery(
        deviceName,
        'kWh_del',
      );
      const currentEnergy = await this.elasticService.search(
        this.plantIndex,
        currentEnergyQuery,
      );
      const midnightEnergy = await this.elasticService.search(
        this.plantIndex,
        midnightEnergyQuery,
      );
      // return {a:currentEnergyMV.hits.hits[0]._source['Energy_exp._Total'] , b:midnightEnergyMV.hits.hits[0]._source['Energy_exp._Total']}
      const energy =
        currentEnergy.hits.hits[0]._source['kWh_del'] -
        midnightEnergy.hits.hits[0]._source['kWh_del'];
      const datetime = currentEnergy.hits.hits[0]._source.DateTime;
      return {
        value: energy,
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
  async energyExportTodayAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    try {
      const { mode } = dateDetails;
      const metric = 'kWh_del';
      const plantIndex = this.plantIndex;

      const fetchMap = {
        M: this.energyService.fetchSantralEnergyTodayAllValueMonthly,
        D: this.energyService.fetchSantralEnergyTodayAllValueDaily,
        Y: this.energyService.fetchSantralEnergyTodayAllValueYearly,
        C: this.energyService.fetchSantralEnergyTodayAllValueCustom,
        default: this.energyService.fetchSantralEnergyTodayAllValueCustom,
      };

      const fetchFn = fetchMap[mode] || fetchMap.default;
      const result = await fetchFn.call(
        this.energyService,
        plantIndex,
        dateDetails,
        metric,
      );

      return this.curveService.buildCurveWithOneValue(
        result,
        entityField.maskFunction,
      );
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: energyExportTodayAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async irradiationLastValue(entity: EntityModel): Promise<IResponseLastValue> {
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
      // const maskedValue = await this.maskFunctionCoreService.ReLU(value);
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
      return this.curveService.buildCurveWithOneValue(mappedResult);
    } catch (error) {
      console.error(
        `error in ${this.plantTag}: irradiationAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }

  async performanceLastValue(entity: EntityModel) {
    try {
      const nominalPower = await this.entityFieldService.fetchStaticValueByTag(
        this.plantId,
        'Nominal_Power',
      );
      if (!nominalPower) return this.lastValueServicesDefaultExport();
      const { value: irradiance, Date: irradianceDateTime } =
        await this.irradiationLastValue(entity);
      const { value: pTotal, Date: powerDateTime } =
        await this.powerLastValue(entity);
      if (!pTotal || !irradiance) return this.lastValueServicesDefaultExport();
      const DateTime = irradianceDateTime || powerDateTime || NaN;
      let performance = 0;
      if (irradiance > 0 && pTotal > 0) {
        performance =
          (pTotal * 100) / (1.179 * parseFloat(nominalPower) * irradiance);
      }
      let masked = this.maskFunctionService.mask(performance, [
        MaskFunctionsEnum.MultiplyByThousand,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]) as number;
      if (masked > 100) {
        masked = 100;
      }
      return {
        value: masked,
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
      const nominalPower = await this.entityFieldService.fetchStaticValueByTag(
        this.plantId,
        'Installed_Power',
      );
      const dcToAcMax = await this.entityFieldService.fetchStaticValueByTag(
        this.plantId,
        'dc_to_ac_max',
      );
      const powerParameter = await this.entityFieldService.fetchIonParameter(
        this.plantId,
      );
      if (
        irradiationEntities.length === 0 ||
        !nominalPower ||
        !powerParameter ||
        !dcToAcMax
      )
        return this.allValueServicesDefaultExport();
      const irradiationDevices = irradiationEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      const elasticQuery = buildSantralPlantPerformanceAllValueQuery(
        nominalPower,
        date_histogram,
        range,
        irradiationDevices,
        this.irradiationParameter,
        dcToAcMax,
      );
      // return elasticQuery
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );

      const mappedResult: IMappedAllValueResult =
        result.aggregations.intervals.buckets.map((item: any) => {
          return {
            DateTime: item.key_as_string,
            value: item.performance?.value ?? 0,
          };
        });
      return this.curveService.buildCurveWithOneValue(mappedResult, [
        MaskFunctionsEnum.MultiplyByMillion,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      ]);
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
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'ION METER',
        this.powerFactorParameter,
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const DateTime = result.hits.hits[0]._source['DateTime'];
      if (!DateTime) return this.lastValueServicesDefaultExport();
      return {
        value: result.hits.hits[0]._source[this.powerFactorParameter],
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
  // async Tlue(
  //   entity: EntityModel,
  // ): Promise<IResponseLastValue> {
  //   try {
  //     const unit = 'kWh/㎡';
  //     const irradiationEntities =
  //       await this.plantService.fetchPlantIrradiationDevices(this.plantId);
  //     const irradiationDevicesName = irradiationEntities.map(
  //       (item) => item.entityTag.split(':')[2],
  //     );
  //     if (irradiationEntities.length === 0)
  //       return this.lastValueServicesDefaultExport();
  //     const elasticQuery = {
  //       size: 0,
  //       _source: [this.irradiationParameter, 'DateTime'],
  //       query: {
  //         bool: {
  //           must: [
  //             {
  //               terms: {
  //                 'DeviceName.keyword': irradiationDevicesName,
  //               },
  //             },
  //             {
  //               range: {
  //                 [this.irradiationParameter]: {
  //                   gt: 0,
  //                 },
  //               },
  //             },
  //             {
  //               range: {
  //                 DateTime: {
  //                   gte: 'now/d',
  //                   lte: 'now',
  //                   time_zone: 'Asia/Tehran',
  //                 },
  //               },
  //             },
  //           ],
  //         },
  //       },
  //       aggs: {
  //         per_day_average: {
  //           date_histogram: {
  //             field: 'DateTime',
  //             fixed_interval: '1d',
  //             time_zone: 'Asia/Tehran',
  //           },
  //           aggs: {
  //             min_time: {
  //               min: {
  //                 field: 'DateTime',
  //               },
  //             },
  //             max_time: {
  //               max: {
  //                 field: 'DateTime',
  //               },
  //             },
  //             avg_ir: {
  //               avg: {
  //                 field: this.irradiationParameter,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     };
  //     const response = await this.elasticService.search(
  //       this.plantIndex,
  //       elasticQuery,
  //     );
  //     const maxTime =
  //       response.aggregations.per_day_average.buckets[0].max_time
  //         .value_as_string;
  //     const minTime =
  //       response.aggregations.per_day_average.buckets[0].min_time
  //         .value_as_string;
  //     const diffrent = getHourlyDifference(minTime, maxTime);
  //     const dailyIrradiance =
  //       (response.aggregations.per_day_average.buckets[0].avg_ir.value *
  //         diffrent) /
  //       1000;
  //     return {
  //       value: dailyIrradiance,
  //       Date: getFormattedDateTime(),
  //     };
  //   } catch (error) {
  //     console.error(
  //       `error in ${this.plantTag}: isolationTodayLastValue service `,
  //       error,
  //     );
  //     return this.lastValueServicesDefaultExport();
  //   }
  // }
  async substationPerformanceLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    return this.lastValueServicesDefaultExport();
  }
  async substationPerformanceAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<any> {
    return this.allValueServicesDefaultExport();
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
      const logFilePrefix = '*' + key + '*';
      const body = buildLosslessSubstationEnergyQuery(
        deviceName,
        logFilePrefix,
        'AC_energy_fed_in_that_day',
      );
      const result = await this.elasticService.search(this.plantIndex, body);
      const energy = result.hits.hits[0]._source['AC_energy_fed_in_that_day'];
      return {
        value: energy,
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
          .fetchSantralPlantSmartLoggerEnergyAfterLossessMonthlyAndYearly,
        D: this.energyService
          .fetchSantralPlantSmartLoggerEnergyAfterLossessCustomAndDaily,
        Y: this.energyService
          .fetchSantralPlantSmartLoggerEnergyAfterLossessMonthlyAndYearly,
        C: this.energyService
          .fetchSantralPlantSmartLoggerEnergyAfterLossessCustomAndDaily,
        default:
          this.energyService
            .fetchSantralPlantSmartLoggerEnergyAfterLossessCustomAndDaily,
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
    } as EntityModel);
    return {
      PR: performance
        ? `$${this.maskFunctionService.mask(
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
      const { value } = await this.isolationTodayLastValue({} as EntityModel,{} as EntityField)
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
  // async fetchMeteo(): Promise<IMeteo> {
  //   try {
  //     const meteoWeatherStationQuery =
  //       buildLatestDeviceObjElasticQuery('Weather station');
  //     const meteoWeatherStation = await this.elasticService.search(
  //       this.plantIndex,
  //       meteoWeatherStationQuery,
  //     );
  //     const data = meteoWeatherStation.hits.hits[0]._source;
  //     const { value } = await this.modLastValue({} as EntityModel);
  //     // const meteoResponse: IMeteo = {
  //     //   WS: data['Wind_speed__akt'],
  //     //   WD: data['Wind_direction_act'],
  //     //   AMB: data['Air_temperature_act'],
  //     //   PvRain: data['Precipitation_intensive_'],
  //     //   HMD: data['Relative_humidity_act'],
  //     //   APress: data['Absolute_air_pressure_act'],
  //     //   PVT: value + ' °C',
  //     //   GHI: '-',
  //     // };

  //     const getValue = (firstKey: string, unit: string): string => {
  //       const val = data[firstKey];
  //       if (val === undefined || val === null || val === '')
  //         return NaN.toString();
  //       return `${val} ${unit}`;
  //     };

  //     const meteoResponse: IMeteo = {
  //       WS: getValue('Wind_speed__akt', 'm/s'),
  //       WD: getValue('Wind_direction_act', '°'),
  //       AMB: getValue('Air_temperature_act', '°C'),
  //       PvRain: getValue('Precipitation_intensive_', 'mm'),
  //       HMD: getValue('Precipitation_intensive_', '%'),
  //       APress: getValue('Absolute_air_pressure_act', 'pa'),
  //       PVT: `${value} °C`,
  //       GHI: '-',
  //     };
  //     return meteoResponse;

  //     // return meteoResponse;
  //   } catch (error) {
  //     console.error(`error in ${this.plantTag}: fetchMeteo service `, error);
  //     return this.defaultMeteoServiceExport();
  //   }
  // }
  async fetchIsolationToday() {
    try {
      const unit = 'kWh/㎡';
      const { value } = await this.isolationTodayLastValue({} as EntityModel,{} as EntityField)
      const maskedValue = this.maskFunctionService.mask(
        value,
        MaskFunctionsEnum.FormatReadableNumber,
      ) as number;
      return unit ? `${maskedValue} ${unit}` : maskedValue.toString();
    } catch (error) {
      return NaN.toString();
    }
  }
  async fetchAmbientTempature() {
    try {
      const elasticQuery = buildLatestDeviceFieldElasticQuery(
        'Weather station',
        'Air_temperature_act',
      );
      const result = await this.elasticService.search(
        this.plantIndex,
        elasticQuery,
      );
      const value = result.hits.hits[0]._source['Air_temperature_act'];
      return value ? value : NaN;
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
      'Weather station',
      'Absolute_humidity_avg',
    );
    const result = await this.elasticService.search(
      this.plantIndex,
      elasticQuery,
    );
    return {
      value:
        result.aggregations.last_value.hits.hits[0]._source
          .Absolute_humidity_avg,
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

      const { value: performance } = await this.performanceLastValue(plant);
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

  async plantActiveDuration(): Promise<IResponseStringsLastValue> {
    const elasticQuery = {
      size: 0,
      aggs: {
        per_day_average: {
          date_histogram: {
            field: 'DateTime',
            fixed_interval: '1d',
            format: "yyyy-MM-dd'T'HH:mm:ss.SSSZZ",
            time_zone: 'Asia/Tehran',
          },
          aggs: {
            min_time: { min: { field: 'DateTime' } },
            max_time: { max: { field: 'DateTime' } },
            avg_I: { avg: { field: 'I_avg' } }, // optional daily average
          },
        },
      },
      query: {
        bool: {
          must: [
            {
              range: {
                DateTime: {
                  gte: 'now/d',
                  lte: 'now',
                  time_zone: '+03:30',
                },
              },
            },
            {
              term: {
                'DeviceName.keyword': 'ION METER',
              },
            },
            {
              range: {
                I_avg: { gt: 1 },
              },
            },
          ],
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
}
