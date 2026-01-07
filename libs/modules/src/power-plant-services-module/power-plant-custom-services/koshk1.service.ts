import { StringPlantService } from '../providers/plant/string-plant.service';
import {
  buildLatestDeviceFieldElasticQuery,
  buildMidnightDeviceFieldQuery,
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
import { EnergyService } from './energy.service';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import { IResponseLastValue } from '../interfaces/base.service.interface';
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { MaskFunctionsEnum } from 'libs/enums';
import { PlantDayLightService } from '../providers/day-light/day-light.service';
import { ICurve } from '../interfaces/curve.interface';
import { getFormattedDateTime, logStringify, setTimeRange } from 'libs/utils';

@Injectable()
export class Koshk1Service extends StringPlantService {
  protected static readonly PLANT_INDEX = 'koshk1-*';
  protected static readonly PLANT_TAG = 'koshk1';
  protected static readonly PLANT_ID = 1173;
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
      Koshk1Service.PLANT_ID,
      Koshk1Service.PLANT_TAG,
      Koshk1Service.PLANT_INDEX,
      Koshk1Service.IRRADIATION_PARAMETER,
      Koshk1Service.POWER_FACTOR_PARAMETER,
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
      entityField: EntityField
    ): Promise<IResponseLastValue> {
      try {
        const elasticQuery = buildLatestDeviceFieldElasticQuery(
          'Moxa1260 SUB 1',
          'RTD0_Value',
        );
        const result = await this.elasticService.search(
          Koshk1Service.PLANT_INDEX,
          elasticQuery,
        );
        const pvModuleTemperature = result.hits.hits[0]?._source['RTD0_Value'];
        const DateTime = result.hits.hits[0]?._source['DateTime'];
        if (pvModuleTemperature == undefined)
          return this.lastValueServicesDefaultExport();
        const maskedValue = this.maskFunctionService.mask(
          pvModuleTemperature,
          MaskFunctionsEnum.ToFixed1,
        ) as number;
        return {
          value: maskedValue,
          Date: DateTime,
        };
      } catch (error) {
        console.error(
          `error in ${Koshk1Service.PLANT_TAG}: modLastValue service `,
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
                    'DeviceName.keyword': ['Moxa1260 SUB 1'],
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
                        "if (doc['DeviceName.keyword'].value == 'Moxa1260 SUB 1') { if (doc['RTD0_Value'].size() >0) { return doc['RTD0_Value'].value; } } return null;",
                    },
                  },
                },
              },
            },
          },
        };
        // console.log(JSON.stringify(body,null,2))
        // Execute the search query
        const response = await this.elastic_Service.search(
          Koshk1Service.PLANT_INDEX,
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
          Koshk1Service.PLANT_TAG,
          dateDetails,
        );
        const { range, date_histogram } = setTimeRange(dateDetails);
        const body = {
          size: 0,
          query: {
            bool: {
              must: [
                { range },
                { term: { 'DeviceName.keyword': 'Moxa1260 SUB 1' } },
              ],
              should,
              minimum_should_match: 1,
            },
          },
          aggs: {
            mod: {
              date_histogram: {
                ...date_histogram,
                min_doc_count: 1,
              },
              aggs: {
                mod: {
                  avg: {
                    field: 'RTD0_Value',
                  },
                },
              },
            },
          },
        };
        const response = await this.elasticService.search(
          Koshk1Service.PLANT_INDEX,
          body,
        );
        const mapped: IMappedAllValueResult =
          response.aggregations.mod.buckets.map((item) => {
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

    override async substaionNetEnergyLastValue(entity: EntityModel) {
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
          Koshk1Service.PLANT_INDEX,
          currentEnergyMVQuery,
        );
        const midnightEnergyMV = await this.elasticService.search(
          Koshk1Service.PLANT_INDEX,
          midnightEnergyMVQuery,
        );
        // return {a:currentEnergyMV.hits.hits[0]._source['Energy_exp._Total'] , b:midnightEnergyMV.hits.hits[0]._source['Energy_exp._Total']}
        const e =
          currentEnergyMV.hits.hits[0]._source['Energy_imp._Total'] -
          midnightEnergyMV.hits.hits[0]._source['Energy_imp._Total'];
        const datetime = currentEnergyMV.hits.hits[0]._source.DateTime;
        return {
          value: e,
          Date: datetime,
        };
      } catch (error) {
        console.error(
          `error in ${Koshk1Service.PLANT_TAG}: substationNetEnergyAfterLossesLastValue service `,
          error,
        );
        return this.lastValueServicesDefaultExport();
      }
    }
    override async substaionNetEnergyTodayAllValues(
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
          Koshk1Service.PLANT_INDEX,
          entity,
          dateDetails,
          'Energy_imp._Total',
        );

        return result;
      } catch (error) {
        console.error(
          `error in ${Koshk1Service.PLANT_TAG}: substaionNetEnergyTodayAllValues service `,
          error,
        );
        return this.allValueServicesDefaultExport();
      }
    }
    override async substaionNetImportedEnergyLastValue(entity: EntityModel) {
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
          Koshk1Service.PLANT_INDEX,
          currentEnergyMVQuery,
        );
        const midnightEnergyMV = await this.elasticService.search(
          Koshk1Service.PLANT_INDEX,
          midnightEnergyMVQuery,
        );
        const eLastValue =
          currentEnergyMV.hits.hits[0]._source['Energy_exp._Total'] -
          midnightEnergyMV.hits.hits[0]._source['Energy_exp._Total'];
        const datetime = currentEnergyMV.hits.hits[0]._source.DateTime;
        return {
          value: eLastValue,
          Date: datetime,
        };
      } catch (error) {
        console.error(
          `error in ${Koshk1Service.PLANT_TAG}: substaionNetImportedEnergyLastValue service `,
          error,
        );
        return this.lastValueServicesDefaultExport();
      }
    }
    override async substaionNetImportedEnergyTodayValues(
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
          Koshk1Service.PLANT_INDEX,
          entity,
          dateDetails,
          'Energy_exp._Total',
        );

        return result;
      } catch (error) {
        console.error(
          `error in ${Koshk1Service.PLANT_TAG}: substaionNetImportedEnergyTodayValues service `,
          error,
        );
        return this.allValueServicesDefaultExport();
      }
    }

    override async substationAcBasicPerformanceLastValue(
     entity: EntityModel,
      entityField: EntityField,
  ) {
    try {
       const isInTheDayResult = await this.plantService.isInTheDay(this.plant_Id);
        if (!isInTheDayResult)
          return {
            lastValue: 0,
            Date: getFormattedDateTime(),
          };
      const { substationDcEnergy: substationEnergy } = await this.plantService.resolveSubstationEnergy(this.plant_Id);
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
          `error in ${this.plant_Tag}: substationAcBasicPerformanceLastValue service `,
          error,
        );
        return this.allValueServicesDefaultExport();
    }
    }
    override async substationAcBasicPerformanceAllValues(
        entity: EntityModel,
        entityField: EntityField,
        dateDetails: IDateDetails,
    ) {
      try {
        const [, substation, device] = entity.entityTag.split(':');
        const { range, date_histogram } = setTimeRange(dateDetails);
        const { substationDcEnergy: plantEnergy } = await this.plantService.resolveSubstationEnergy(Koshk1Service.PLANT_ID);
        const body = {
          size: 0,
          _source: [Koshk1Service.IRRADIATION_PARAMETER, 'P_total', 'DateTime'],
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
                      source: `if (doc['DeviceName.keyword'].value == '${device}') { if (doc['P_total'].size() > 0 && doc['P_total'].value>0) { return Math.abs(doc['P_total'].value); } } return null;`,
                    },
                  },
                },
              },
            },
          },
        };
        const response = await this.elasticService.search(Koshk1Service.PLANT_INDEX , body)
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
            `error in ${Koshk1Service.PLANT_TAG}: substationAcBasicPerformanceAllValues service `,
            error,
          );
          return this.allValueServicesDefaultExport();
      }
    }
    override async substationAcRawPerformanceLastValue(
      entity: EntityModel,
      entityField: EntityField,
    ) {
      try {
        const isInTheDayResult = await this.plantService.isInTheDay(Koshk1Service.PLANT_ID);
        if (!isInTheDayResult)
          return {
            lastValue: 0,
            Date: getFormattedDateTime(),
          };
        const { minIrradianceToCalculatePerformance } =
          await this.plantService.resolvePlantPerformanceLimit(Koshk1Service.PLANT_ID);
        const { substationDcEnergy: substationEnergy } =
          await this.plantService.resolveSubstationEnergy(Koshk1Service.PLANT_ID);
        const power = await this.fetchMvPower(entity);
        const { value: irradiance } = await this.irradiationLastValue(
          {} as EntityModel,{} as EntityField
        );
        let performance = 0;
        if (power > 0 && irradiance > minIrradianceToCalculatePerformance) {
          performance =(power * 100000000) / (substationEnergy * irradiance);
        }
        return {
          lastValue: performance,
          Date: getFormattedDateTime(),
        };
      } catch (err) {
         console.error(
          `error in ${this.plant_Tag}: substationAcCorrectPerformanceLastValue service `,
          err,
        );
        return this.lastValueServicesDefaultExport();
      }
    }
    override async substationAcRawPerformanceAllValues(
      entity: EntityModel,
      entityField: EntityField,
      dateDetails: IDateDetails,
    ) {
      try {
        const { minIrradianceToCalculatePerformance } =
          await this.plantService.resolvePlantPerformanceLimit(Koshk1Service.PLANT_ID);
        const should = await this.dayLightService.generateShouldClause(
          Koshk1Service.PLANT_TAG,
          dateDetails,
        );
        const [, substation, device] = entity.entityTag.split(':');
        const { range, date_histogram } = setTimeRange(dateDetails);
        const { substationDcEnergy: substationEnergy } =
          await this.plantService.resolveSubstationEnergy(Koshk1Service.PLANT_ID);
        const irradiationEntities =
          await this.plantService.fetchPlantIrradiationDevices(Koshk1Service.PLANT_ID);
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
      doc['${Koshk1Service.IRRADIATION_PARAMETER}'].size() > 0 &&
      doc['${Koshk1Service.IRRADIATION_PARAMETER}'].value > 0
    ) {
      return doc['${Koshk1Service.IRRADIATION_PARAMETER}'].value;
    }
  }
  return null;
  `.trim();
  
        const powerElasticScriptCondition = mvDevice
          .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
          .join(' || ');
  
        const powerElasticScript = `
  if (${powerElasticScriptCondition}) {
    if (doc['P_total'].size() > 0 && doc['P_total'].value > 0) {
      return Math.abs(doc['P_total'].value);
    }
  }
  return null;
  `.trim();
        const body = {
          size: 0,
          _source: [Koshk1Service.IRRADIATION_PARAMETER, 'P_total', 'DateTime'],
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
        const response = await this.elasticService.search(Koshk1Service.PLANT_TAG, body);
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
          `error in ${Koshk1Service.PLANT_TAG}: substationAcRawPerformanceAllValues service `,
          error,
        );
        return this.allValueServicesDefaultExport();
      }
    }
    override async substationAcCorrectPerformanceLastValue(
      entity: EntityModel,
      entityField: EntityField,
    ) {
      try {
        const isInTheDayResult = await this.plantService.isInTheDay(Koshk1Service.PLANT_ID);
        if (!isInTheDayResult)
          return {
            lastValue: 0,
            Date: getFormattedDateTime(),
          };
        const { minIrradianceToCalculatePerformance, alphaFactor } =
          await this.plantService.resolvePlantPerformanceLimit(Koshk1Service.PLANT_ID);
        const { substationDcEnergy: substationEnergy } =
          await this.plantService.resolveSubstationEnergy(Koshk1Service.PLANT_ID);
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
          `error in ${this.plant_Tag}: substationAcCorrectPerformanceLastValue service `,
          err,
        );
        return this.lastValueServicesDefaultExport();
      }
    }
    override async substationAcCorrectPerformanceAllValues(
      entity: EntityModel,
      entityField: EntityField,
      dateDetails: IDateDetails,
    ) {
      try {
        const { minIrradianceToCalculatePerformance, alphaFactor } =
          await this.plantService.resolvePlantPerformanceLimit(Koshk1Service.PLANT_ID);
        const should = await this.dayLightService.generateShouldClause(
          Koshk1Service.PLANT_TAG,
          dateDetails,
        );
        const mods = await this.modAllValues(
          {} as EntityModel,
          {} as EntityField,
          dateDetails,
        );
        const [, substation, device] = entity.entityTag.split(':');
        const { range, date_histogram } = setTimeRange(dateDetails);
        const { substationDcEnergy: substationEnergy } = await this.plantService.resolveSubstationEnergy(Koshk1Service.PLANT_ID);
        const irradiationEntities = await this.plantService.fetchPlantIrradiationDevices(Koshk1Service.PLANT_ID)
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
      doc['${Koshk1Service.IRRADIATION_PARAMETER}'].size() > 0 &&
      doc['${Koshk1Service.IRRADIATION_PARAMETER}'].value > 0
    ) {
      return doc['${Koshk1Service.IRRADIATION_PARAMETER}'].value;
    }
  }
  return null;
  `.trim();
  
        const powerElasticScriptCondition = mvDevice
          .map((name) => `doc['DeviceName.keyword'].value == '${name}'`)
          .join(' || ');
  
        const powerElasticScript = `
  if (${powerElasticScriptCondition}) {
    if (doc['P_total'].size() > 0 && doc['P_total'].value > 0) {
      return Math.abs(doc['P_total'].value);
    }
  }
  return null;
  `.trim();
        const body = {
          size: 0,
          _source: [Koshk1Service.IRRADIATION_PARAMETER, 'P_total', 'DateTime'],
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
        const response = await this.elasticService.search(Koshk1Service.PLANT_INDEX, body);
        logStringify(body)
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
          `error in ${Koshk1Service.PLANT_TAG}: substationAcCorrectPerformanceAllValues service `,
          error,
        );
        return this.allValueServicesDefaultExport();
      }
    }
}
