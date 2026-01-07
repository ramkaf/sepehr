import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  availabilityLastValueQuery,
  buildAvailabilityAllValuesQuery,
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
} from '../../../insight';
import { CurveModelService } from '../curve/curve.factory.service';
import { SourceService } from '../../../entity-management';
import { EnergyService } from '../../power-plant-custom-services/energy.service';
import { MaskFunctionService } from '../mask-functions/mask-function.service';
import { IResponseLastValue } from '../../interfaces/base.service.interface';
import { PLANT_AVAILABILITY_INDEX } from 'libs/constants';
import {
  addCumulativeToBuckets,
  calculateDifferentBetween2DateInHours,
  getHourlyDifference,
  setTimeRange,
  toIranOffset,
} from 'libs/utils';
import {
  IAllValuesServicesResult,
  IDateDetails,
  IMappedAllValueResult,
  PeriodEnum,
} from 'libs/interfaces';
import { ICurve } from '../../interfaces/curve.interface';
import { PlantDayLightService } from '../day-light/day-light.service';
import { MaskFunctionsEnum } from 'libs/enums';

@Injectable()
export abstract class BasePlantService {
  constructor(
    protected readonly plant_Id: number,
    protected readonly plant_Tag: string,
    protected readonly plant_Index: string,
    protected readonly irradiation_Parameter: string,
    protected readonly powerFactor_Parameter: string,
    protected readonly elastic_Service: ElasticService,
    protected readonly plant_Service: PlantService,
    protected readonly curve_Service: CurveModelService,
    protected readonly entityField_Service: EntityFieldService,
    protected readonly entity_Service: EntityService,
    protected readonly status_Service: PlantStatusService,
    protected readonly source_Service: SourceService,
    protected readonly mask_Function_Service: MaskFunctionService,
    protected readonly state_Service: PlantStateService,
    protected readonly energy_Service: EnergyService,
    protected readonly day_light_service: PlantDayLightService,
  ) {}
  async availabilityLastValue(
    entity: EntityModel,
  ): Promise<IResponseLastValue> {
    try {
      const { entityTag } = entity;
      const elasticQuery = availabilityLastValueQuery(entityTag);
      const result = await this.elastic_Service.search(
        PLANT_AVAILABILITY_INDEX,
        elasticQuery,
      );
      return {
        value: result.hits.hits[0]._source['availability'] as number,
        Date: result.hits.hits[0]._source['DateTime'],
      };
    } catch (error) {
      console.log(
        `error in ${this.plant_Tag} availability lastValue : ` + error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async availabilityAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    const { entityTag } = entity;
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const elasticQuery = buildAvailabilityAllValuesQuery(
        entityTag,
        range,
        date_histogram,
      );
      const result = await this.elastic_Service.search(
        PLANT_AVAILABILITY_INDEX,
        elasticQuery,
      );
      const mappedAllValueResult: IAllValuesServicesResult[] =
        result.aggregations.date_histogram.buckets.map((item: any) => {
          return {
            DateTime: item.key_as_string,
            max: item.max.value,
            min: item.min.value,
            avg: item.avg.value,
            current: item.current.hits.hits[0]._source['availability'],
          };
        });
      return this.curve_Service.buildCurve(mappedAllValueResult, null);
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag}: availabilityAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async isolationTodayLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ): Promise<IResponseLastValue> {
    try {
      const unit = 'kWh/㎡';
      const irradiationEntities =
        await this.plant_Service.fetchPlantIrradiationDevices(this.plant_Id);
      const irradiationDevicesName = irradiationEntities.map(
        (item) => item.entityTag.split(':')[2],
      );
      if (irradiationEntities.length === 0)
        return this.lastValueServicesDefaultExport();
      const elasticQuery = {
        size: 0,
        _source: [this.irradiation_Parameter, 'DateTime'],
        query: {
          bool: {
            must: [
              {
                terms: {
                  'DeviceName.keyword': irradiationDevicesName,
                },
              },
              {
                range: {
                  [this.irradiation_Parameter]: {
                    gt: 0,
                  },
                },
              },
              {
                range: {
                  DateTime: {
                    gte: 'now/d',
                    lte: 'now',
                    time_zone: 'Asia/Tehran',
                  },
                },
              },
            ],
          },
        },
        aggs: {
          per_day_average: {
            date_histogram: {
              field: 'DateTime',
              fixed_interval: '1d',
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
              avg_ir: {
                avg: {
                  field: this.irradiation_Parameter,
                },
              },
            },
          },
        },
      };
      const response = await this.elastic_Service.search(
        this.plant_Index,
        elasticQuery,
      );
      const maxTime =
        response.aggregations.per_day_average.buckets[0].max_time
          .value_as_string;
      const minTime =
        response.aggregations.per_day_average.buckets[0].min_time
          .value_as_string;
      const { diffHours } = calculateDifferentBetween2DateInHours(
        minTime,
        maxTime,
      );
      const dailyIrradiance =
        (response.aggregations.per_day_average.buckets[0].avg_ir.value *
          diffHours) /
        1000;
      return {
        value: dailyIrradiance,
        Date: NaN.toString(),
      };
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag}: isolationTodayLastValue service `,
        error,
      );
      return this.lastValueServicesDefaultExport();
    }
  }
  async isolationTodayAllValuesCustom(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails_: IDateDetails,
  ) {
    const dateDetails =
      dateDetails_.mode === 'default'
        ? dateDetails_
        : {
            mode: dateDetails_.mode,
            startDate: toIranOffset(dateDetails_.startDate!),
            endDate: toIranOffset(dateDetails_.endDate!),
          };
    const intervals =
      await this.day_light_service.computeDailyDaylightIntervals(
        this.plant_Tag,
        dateDetails,
      );
    const should = this.day_light_service.buildDaylightShouldClauses(intervals);
    const irradianceDevices =
      await this.plant_Service.fetchPlantIrradiationDevices(this.plant_Id);
    const irradiationDeviceEntityTags = irradianceDevices.map(
      (item) => item.entityTag,
    );
    const query = {
      query: {
        bool: {
          must: [
            {
              terms: {
                'DeviceName.keyword': [irradiationDeviceEntityTags],
              },
            },
          ],
          should,
          minimum_should_match: 1,
        },
      },
      aggs: {
        agg: {
          date_histogram: {
            field: 'DateTime',
            fixed_interval: '15m',
            time_zone: 'Asia/Tehran',
          },
          aggs: {
            total_sum: {
              sum: {
                field: this.irradiation_Parameter,
              },
            },
            doc_count: {
              value_count: {
                field: 'DateTime',
              },
            },
          },
        },
      },
      size: 0,
    };
    const response = await this.elastic_Service.search(this.plant_Index, query);
    const res = response.aggregations.agg.buckets;
    const appendedData = addCumulativeToBuckets(res);
    const mapped: IMappedAllValueResult = appendedData.map(
      (item, arrayIndex) => {
        const time = item.key_as_string;
        const output = time.replace(
          /T\d{2}:\d{2}:\d{2}\.\d{3}/,
          'T00:00:00.000',
        );
        const { start, end } = intervals.find((obj) => obj.date === output);
        let { diffHours: realDif } = calculateDifferentBetween2DateInHours(
          start,
          item.key_as_string,
        );
        const isLast = arrayIndex === appendedData.length - 1;
        if (isLast) {
          const { diffHours: diffToEnd } =
            calculateDifferentBetween2DateInHours(time, end);
          if (diffToEnd < 0.25) {
            const { diffHours } = calculateDifferentBetween2DateInHours(
              start,
              end,
            );
            realDif = diffHours;
          }
        }
        const isolation = realDif * item.cumulative_avg;
        return {
          DateTime: item.key_as_string,
          value: isolation,
        };
      },
    );
    return this.curve_Service.buildCurveWithOneValue(
      mapped,
      MaskFunctionsEnum.DivideByThousand,
    );
  }
  async isolationTodayAllValuesYearlyMonthlyDaily(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      const { date_histogram } = setTimeRange(dateDetails);
      const { startDate, endDate } = dateDetails;
      if (!startDate || !endDate) return null;
      const dateDetails_ = {
        mode: dateDetails.mode,
        startDate: toIranOffset(startDate),
        endDate: toIranOffset(endDate),
      };
      const intervals =
        await this.day_light_service.computeDailyDaylightIntervals(
          'jarghoyeh',
          dateDetails_,
        );
      const should =
        this.day_light_service.buildDaylightShouldClauses(intervals);
      const irradianceDevices =
        await this.plant_Service.fetchPlantIrradiationDevices(this.plant_Id);
      const irradiationDeviceEntityTags = irradianceDevices.map(
        (item) => item.entityTag.split(':')[2],
      );

      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              // { range: { DateTime: { gte: start, lte: end } } },
              { terms: { 'DeviceName.keyword': irradiationDeviceEntityTags } },
            ],
            should,
            minimum_should_match: 1,
          },
        },
        aggs: {
          irradiance: {
            date_histogram: { ...date_histogram, min_doc_count: 1 },
            aggs: {
              irr: {
                avg: {
                  field: this.irradiation_Parameter,
                },
              },
            },
          },
        },
      };
      const response = await this.elastic_Service.search(
        this.plant_Index,
        body,
      );
      const daylights = this.day_light_service.calculateDurations(should);
      const mapped: IMappedAllValueResult =
        response.aggregations.irradiance.buckets.map((item) => {
          const { duration } = daylights.find(
            (obj) =>
              obj.mode === dateDetails.mode && obj.date === item.key_as_string,
          );
          const irradiance = item.irr.value ?? 0;
          const isolation = irradiance * duration;
          return {
            DateTime: item.key_as_string,
            value: isolation,
          };
        });
      return this.curve_Service.buildCurveWithOneValue(
        mapped,
        MaskFunctionsEnum.DivideByThousand,
      );
    } catch (error) {
      console.log(error);
    }
  }
  async isolationTodayAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ) {
    try {
      let result;
      const { mode } = dateDetails;

      switch (mode) {
        case PeriodEnum.M:
          result = await this.isolationTodayAllValuesYearlyMonthlyDaily(
            entity,
            entityField,
            dateDetails,
          );
          break;
        case PeriodEnum.D:
          result = await this.isolationTodayAllValuesYearlyMonthlyDaily(
            entity,
            entityField,
            dateDetails,
          );
          break;
        case PeriodEnum.Y:
          result = await this.isolationTodayAllValuesYearlyMonthlyDaily(
            entity,
            entityField,
            dateDetails,
          );
          break;
        case PeriodEnum.C:
          result = await this.isolationTodayAllValuesCustom(
            entity,
            entityField,
            dateDetails,
          );
          break;
        case PeriodEnum.Default:
          result = await this.isolationTodayAllValuesCustom(
            entity,
            entityField,
            dateDetails,
          );
          break;
        default:
          throw new BadRequestException(`Unsupported mode: ${mode}`);
      }

      return result;
    } catch (error) {
      console.error(
        `error in ${this.plant_Tag}: isolationTodayAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
  async modLastValue(
    entity: EntityModel,
    entityField: EntityField,
  ): Promise<IResponseLastValue> {
    return this.lastValueServicesDefaultExport();
  }
  async modAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    return this.allValueServicesDefaultExport();
  }
  async modDailyAllValues(
    entity: EntityModel,
    entityField: EntityField,
    dateDetails: IDateDetails,
  ): Promise<ICurve> {
    return this.allValueServicesDefaultExport();
  }

  async fetchCountry() {
    return await this.entityField_Service.fetchStaticValueByTag(
      this.plant_Id,
      'country',
    );
  }

  async fetchNominalPower() {
    try {
      const field = await this.entityField_Service.fetchPlantEntityFieldByTag(
        this.plant_Id,
        'Nominal_Power',
      );
      if (!field) return NaN;
      const { unit, staticValue } = field;
      return unit ? `${staticValue} ${unit}` : staticValue;
    } catch (error) {
      console.error(`Error fetching ${this.plant_Tag} NominalPower`, error);
      return NaN;
    }
  }
  async fechDataDelay() {
    try {
      const field = await this.entityField_Service.fetchPlantEntityFieldByTag(
        this.plant_Id,
        'Data_Delay',
      );
      if (!field) return NaN;
      const { unit, staticValue } = field;
      return unit ? `${staticValue} ${unit}` : staticValue;
    } catch (error) {
      console.error(`Error fetching ${this.plant_Tag} DataDelay`, error);
      return NaN;
    }
  }
  async fetchAlert1(): Promise<number> {
    const result = await this.status_Service.fetchPlantStatus(this.plant_Tag);
    const warningStateEntity = result.filter(
      (obj: any) => obj.status == 'Warning',
    );
    return warningStateEntity.length;
  }
  async fetchAlert2(): Promise<number> {
    const result = await this.status_Service.fetchPlantStatus(this.plant_Tag);

    const majorAndMinorAlarmEntities = result.filter(
      (obj: any) => obj.status == 'Major' || obj.status == 'Minor',
    );
    return majorAndMinorAlarmEntities.length;
  }
  async fetchInverterStatus() {
    const result = await this.status_Service.fetchPlantStatus(this.plant_Tag);
    const invertersStatus = result.filter((item: any) =>
      item.source_str.includes('Inverter'),
    );
    let communicationErrorInvsCount = 0;
    let AlarmMajorInvsCount = 0;
    let AlarmMinorInvsCount = 0;
    let AlarmWarningInvsCount = 0;
    invertersStatus.forEach((inverterStatus: any) => {
      if (inverterStatus.status != 'Normal') {
        communicationErrorInvsCount = communicationErrorInvsCount + 1;
      } else if (['Major'].includes(inverterStatus.level)) {
        AlarmMajorInvsCount = AlarmMajorInvsCount + 1;
      } else if (['Minor'].includes(inverterStatus.level)) {
        AlarmMinorInvsCount = AlarmMinorInvsCount + 1;
      } else if (inverterStatus.level == 'Warning') {
        AlarmWarningInvsCount = AlarmWarningInvsCount + 1;
      }
    });
    return {
      normalInvertersCount:
        invertersStatus.length -
        (AlarmMajorInvsCount +
          AlarmMinorInvsCount +
          AlarmWarningInvsCount +
          communicationErrorInvsCount),
      warningAlarmInvertersCount: AlarmWarningInvsCount,
      minorAlarmInvertersCount: AlarmMinorInvsCount,
      criticalAlarmInvertersCount:
        AlarmMajorInvsCount + communicationErrorInvsCount,
    };
  }

  protected async fetchParameterUnit(fieldTag: string) {
    const unit = await this.entityField_Service.fetchPlantEntityFieldUnitByTag(
      this.plant_Id,
      fieldTag,
    );
    if (!unit) return '';
    return unit;
  }
  protected lastValueServicesDefaultExport(): IResponseLastValue {
    return {
      value: NaN,
      Date: '',
    };
  }
  protected allValueServicesDefaultExport() {
    return [];
  }

  protected fleetServicesDefaultExport() {
    return NaN;
  }
  protected defaultMeteoServiceExport() {
    return {
      WS: NaN.toString(),
      WD: NaN.toString(),
      AMB: NaN.toString(),
      PvRain: NaN.toString(),
      HMD: NaN.toString(),
      APress: NaN.toString(),
      PVT: NaN.toString(),
      GHI: '-',
    };
  }
  protected processIrradiationData(
    buckets: any[],
    irradiationParameter: string,
  ) {
    if (!buckets?.length) {
      return {
        averageIrradiance: 0,
        latestDateTime: null,
      };
    }

    let totalIrradiance = 0;
    let validEntries = 0;
    let latestDateTime: string | null = null;

    for (const bucket of buckets) {
      try {
        const hit = bucket.last_record?.hits?.hits?.[0];
        if (!hit) continue;

        const { _source } = hit;
        if (!_source) continue;

        // Process irradiance
        const irradiance = _source[irradiationParameter];
        if (typeof irradiance === 'number' && !isNaN(irradiance)) {
          totalIrradiance += irradiance;
          validEntries++;
        }

        // Process datetime
        const dateTime = _source.DateTime;
        if (dateTime && typeof dateTime === 'string') {
          if (
            !latestDateTime ||
            new Date(dateTime) > new Date(latestDateTime)
          ) {
            latestDateTime = dateTime;
          }
        }
      } catch (error) {
        console.warn('Error processing bucket:', error);
        continue;
      }
    }

    const averageIrradiance: number =
      validEntries > 0
        ? parseFloat((totalIrradiance / validEntries).toFixed(2))
        : 0;

    return {
      averageIrradiance,
      latestDateTime,
    };
  }
  protected flattenWeather(data: any) {
    const { data: weatherData } = data;

    // prefix wind properties
    const windWithPrefix = Object.fromEntries(
      Object.entries(weatherData.wind || {}).map(([key, value]) => [
        `wind_${key}`,
        value,
      ]),
    );

    return {
      dt: weatherData.dt,
      ...weatherData.main,
      ...weatherData.weather[0], // take first weather object
      ...weatherData.clouds,
      ...windWithPrefix,
      visibility: weatherData.visibility,
      pod: weatherData.sys.pod,
      dt_txt: weatherData.dt_txt,
      plant_id: data.plant_id,
      plant_tag: data.plant_tag,
      DateTime: data.DateTime,
    };
  }
}
