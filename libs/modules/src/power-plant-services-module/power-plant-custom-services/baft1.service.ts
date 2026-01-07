import { StringPlantService } from '../providers/plant/string-plant.service';
import { ElasticService } from 'libs/database';
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
import { MaskFunctionService } from '../providers/mask-functions/mask-function.service';
import { PlantDayLightService } from '../providers/day-light/day-light.service';

@Injectable()
export class Baft1Service extends StringPlantService {
  protected static readonly PLANT_INDEX = 'baft1-*';
  protected static readonly PLANT_TAG = 'baft1';
  protected static readonly PLANT_ID = 1396;
  private static readonly IRRADIATION_PARAMETER = 'Irradiation';
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
      Baft1Service.PLANT_ID,
      Baft1Service.PLANT_TAG,
      Baft1Service.PLANT_INDEX,
      Baft1Service.IRRADIATION_PARAMETER,
      Baft1Service.POWER_FACTOR_PARAMETER,
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
  //     const irradiationDevicesName = ['FeederIO'];
  //     const elasticQuery = buildIrradianceLastValueQuery(
  //       irradiationDevicesName,
  //       Baft1Service.IRRADIATION_PARAMETER,
  //     );
  //     const response = await this.elasticService.search(
  //       Baft1Service.PLANT_INDEX,
  //       elasticQuery,
  //     );
  //     const { averageIrradiance: value, latestDateTime: Date } =
  //       this.processIrradiationData(
  //         response.aggregations.last_irradiance_per_device.buckets,
  //         Baft1Service.IRRADIATION_PARAMETER,
  //       );
  //     if (!value || !Date) return this.lastValueServicesDefaultExport();
  //     return {
  //       value,
  //       Date,
  //     };
  //   } catch (error) {
  //     console.error(
  //       `error in ${Baft1Service.PLANT_TAG}: irradiationLastValue service `,
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
  //     const irradiationDevicesName = ['FeederIO'];
  //     const elasticQuery = buildIrradianceAllValueQuery(
  //       irradiationDevicesName,
  //       Baft1Service.IRRADIATION_PARAMETER,
  //       range,
  //       date_histogram,
  //     );
  //     // return {elasticQuery}
  //     const response = await this.elasticService.search(
  //       Baft1Service.PLANT_INDEX,
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
  //       `error in ${Baft1Service.PLANT_TAG}: irradiationAllValues service `,
  //       error,
  //     );
  //     return this.allValueServicesDefaultExport();
  //   }
  // }
}
