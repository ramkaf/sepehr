import { StringPlantService } from '../providers/plant/string-plant.service';
import { ElasticService, EntityField, EntityModel } from 'libs/database';
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
import { MaskFunctionCoreService } from '../providers/mask-functions/mask-function-core.service';
import { EnergyService } from './energy.service';
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { PlantDayLightService } from '../providers/day-light/day-light.service';
import { getFormattedDate, setTimeRange } from 'libs/utils';
import { ICurve } from '../interfaces/curve.interface';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import { IResponseLastValue } from '../interfaces/base.service.interface';
import { MaskFunctionsEnum } from 'libs/enums';

@Injectable()
export class Koshk2Service extends StringPlantService {
  private static readonly PLANT_INDEX = 'koshk2-*';
  private static readonly PLANT_TAG = 'koshk2';
  private static readonly PLANT_ID = 1287;
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
      Koshk2Service.PLANT_ID,
      Koshk2Service.PLANT_TAG,
      Koshk2Service.PLANT_INDEX,
      Koshk2Service.IRRADIATION_PARAMETER,
      Koshk2Service.POWER_FACTOR_PARAMETER,
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
        size: 1,
        sort: [{ DateTime: { order: 'desc' } }],
        _source: ['PV_temp', 'DateTime'],
        query: {
          bool: {
            should: [{ term: { 'DeviceName.keyword': 'PV Temp' } }],
            minimum_should_match: 1,
          },
        },
      };
      const response = await this.elasticService.search(
        Koshk2Service.PLANT_INDEX,
        body,
      );
      const value = response.hits.hits[0]._source['PV_temp'].toString();
      const Date = response.hits.hits[0]._source['DateTime'].toString();

      return { value, Date };
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
                      "if (doc['DeviceName.keyword'].value == 'PV Temp') { if (doc['PV_temp'].size() >0) { return doc['PV_temp'].value; } } return null;",
                  },
                },
              },
            },
          },
        },
      };
      const response = await this.elasticService.search(
        Koshk2Service.PLANT_INDEX,
        body,
      );
      const mapped: IMappedAllValueResult =
        response.aggregations.intervals.buckets.map((item: any) => {
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
        `error in ${Koshk2Service.PLANT_TAG}: modAllValues service `,
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
    try {
      const should = await this.dayLightService.generateShouldClause(
        Koshk2Service.PLANT_TAG,
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
        Koshk2Service.PLANT_INDEX,
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
        `error in ${Koshk2Service.PLANT_TAG}: modDailyAllValues service `,
        error,
      );
      return this.allValueServicesDefaultExport();
    }
  }
}
