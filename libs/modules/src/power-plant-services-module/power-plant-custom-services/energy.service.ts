import { Injectable } from '@nestjs/common';
import { IDateDetails, IMappedAllValueResult } from 'libs/interfaces';
import {
  findMidnightValues,
  mergeByDate,
  mergeByDateMidnight,
  setTimeRange,
} from 'libs/utils';
import {
  buildMeterEnergyTodayMonthlyQuery,
  buildMeterEnergyTodayYearlyQuery,
  ElasticService,
  EntityModel,
  buildMeterEnergyTodayCustomQuery,
  buildMeterEnergyTodayDailyQuery,
  buildEnergyTodayWithLossesMonthlyQuery,
  buildEnergyTodayWithLossesCustomQuery,
  buildEnergyTodayWithLossesDailyQuery,
  buildEnergyTodayWithLossesYearlyQuery,
  buildEnergyTodayWithoutLossesCustomQuery,
  buildEnergyTodayWithoutLossesDailyQuery,
  buildEnergyTodayWithoutLossesMonthlyQuery,
  buildEnergyTodayWithoutLossesYearlyQuery,
  buildIonMeterEnergyTodayMonthlyQuery,
  buildIonMeterEnergyTodayYearlyQuery,
  buildIonMeterEnergyTodayDailyQuery,
  buildIonMeterEnergyTodayCustomQuery,
  buildIonEnergyTodayWithoutLossesMonthlyAndYearlyQuery,
} from 'libs/database';
import { SourceService } from '../../entity-management';
import { CurveModelService } from '../providers/curve/curve.factory.service';
import { MaskFunctionsEnum } from 'libs/enums';

@Injectable()
export class EnergyService {
  constructor(
    private readonly elasticService: ElasticService,
    private readonly sourceService: SourceService,
    private readonly curveService: CurveModelService,
  ) {}

  async fetchStringEnergyTodayAllValueMonthly(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildMeterEnergyTodayMonthlyQuery(range, engParameter);
    const response = await this.elasticService.search(plantIndex, elasticQuery);

    const hv1 = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'HV1 POWER METER OUT 1',
    ).by_month.buckets;
    const hv2 = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'HV1 POWER METER OUT 2',
    )?.by_month?.buckets;
    // return hv1
    const hv1Remap = hv1.map((item: any) => {
      return {
        Date: item.key_as_string,
        differentHV1:
          item.last_value.hits.hits[0]._source[engParameter] -
          item.first_value.hits.hits[0]._source[engParameter],
      };
    });
    const hv2Remap = hv2?.map((item: any) => {
      return {
        Date: item.key_as_string,
        differentHV2:
          item.last_value.hits.hits[0]._source[engParameter] -
          item.first_value.hits.hits[0]._source[engParameter],
      };
    });
    const mergedHVs = hv1Remap.map((item1: any) => {
      const item2 = hv2Remap?.find((item: any) => item.Date === item1.Date);
      return {
        ...item1,
        ...(item2 || {}),
        ETotal: item1.differentHV1 + (item2?.differentHV2 ?? 0),
      };
    });
    const mappedResults: IMappedAllValueResult = mergedHVs.map((item: any) => {
      return {
        value: item.ETotal,
        DateTime: item.Date,
      };
    });
    return this.curveService.buildCurveWithOneValue(mappedResults);
  }
  async fetchStringEnergyTodayAllValueCustom(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildMeterEnergyTodayCustomQuery(range, engParameter);
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const EHV1 = response.aggregations.avgEnergies.buckets
      .find((item: any) => item.key === 'HV1 POWER METER OUT 1')
      .by_custom.buckets?.map((item: any) => {
        return {
          date: item.key_as_string,
          avgHV1: item?.avg_energy?.hits?.hits[0]?._source[engParameter] ?? 0,
        };
      });
    const EHV2 = response.aggregations.avgEnergies.buckets
      .find((item: any) => item.key === 'HV1 POWER METER OUT 2')
      ?.by_custom?.buckets?.map((item: any) => {
        return {
          date: item.key_as_string,
          avgHV2: item?.avg_energy?.hits?.hits[0]?._source[engParameter] ?? 0,
        };
      });
    // return response
    const midnightHV1 = response.aggregations.midnightValues.buckets
      .find((item: any) => item.key === 'HV1 POWER METER OUT 1')
      .by_day.buckets.map((item: any) => {
        return {
          date: item.key_as_string,
          midnightEnergyHV1:
            item.first_energy_value.hits.hits[0]._source[engParameter] ?? 0,
        };
      });
    const midnightHV2 = response.aggregations.midnightValues.buckets
      .find((item: any) => item.key === 'HV1 POWER METER OUT 2')
      ?.by_day?.buckets?.map((item: any) => {
        return {
          date: item.key_as_string,
          midnightEnergyHV2:
            item.first_energy_value.hits.hits[0]._source[engParameter] ?? 0,
        };
      });

    const mergedMidnight = mergeByDateMidnight(midnightHV1, midnightHV2);
    const mergedEnergy = mergeByDate(EHV1, EHV2);
    const matchEnergies = findMidnightValues(mergedEnergy, mergedMidnight);
    const allValueResult = matchEnergies.map((item) => {
      return {
        value:
          (item.totalEnergy ?? 0) - (item.midnight.totalMidnightEnergy ?? 0),
        DateTime: item.date,
      };
    });
    return this.curveService.buildCurveWithOneValue(allValueResult);
  }
  async fetchStringEnergyTodayAllValueDaily(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildMeterEnergyTodayDailyQuery(range, engParameter);

    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const hv1 = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'HV1 POWER METER OUT 1',
    ).by_day.buckets;
    const hv2 = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'HV1 POWER METER OUT 2',
    )?.by_day?.buckets;
    const hv1Remap = hv1?.map((item: any) => {
      let t1 = item.last_value.hits.hits[0]?._source[engParameter];
      let t2 = item.first_value.hits.hits[0]?._source[engParameter];
      if (!t1 || !t2) {
        t1 = 0;
        t2 = 0;
      }

      return {
        Date: item.key_as_string,
        differentHV1: t1 - t2,
      };
    });
    // return hv1Remap
    const hv2Remap = hv2?.map((item: any) => {
      let t1 = item.last_value.hits.hits[0]?._source[engParameter];
      let t2 = item.first_value.hits.hits[0]?._source[engParameter];
      if (!t1 || !t2) {
        t1 = 0;
        t2 = 0;
      }

      return {
        Date: item.key_as_string,
        differentHV1: t1 - t2,
      };
    });
    // return hv1Remap
    const mergedHVs = hv1Remap.map((item1: any) => {
      const item2 = hv2Remap?.find((item: any) => item.Date === item1.Date);
      return {
        ...item1,
        ...(item2 || {}),
        ETotal: item1.differentHV1 + (item2?.differentHV2 ?? 0),
      };
    });
    const mappedResult: IMappedAllValueResult = mergedHVs.map((item: any) => {
      return {
        DateTime: item.Date,
        value: item.ETotal,
      };
    });
    return this.curveService.buildCurveWithOneValue(mappedResult);
  }
  async fetchStringEnergyTodayAllValueYearly(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildMeterEnergyTodayYearlyQuery(range, engParameter);

    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const hv1 = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'HV1 POWER METER OUT 1',
    ).by_year.buckets;
    const hv2 = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'HV1 POWER METER OUT 2',
    )?.by_year?.buckets;
    // return hv1
    const hv1Remap = hv1.map((item: any) => {
      return {
        Date: item.key_as_string,
        differentHV1:
          (item.last_value.hits.hits[0]._source[engParameter] ?? 0) -
          (item.first_value.hits.hits[0]._source[engParameter] ?? 0),
      };
    });
    const hv2Remap = hv2?.map((item: any) => {
      return {
        Date: item.key_as_string,
        differentHV2:
          (item.last_value.hits.hits[0]._source[engParameter] ?? 0) -
          (item.first_value.hits.hits[0]._source[engParameter] ?? 0),
      };
    });
    const mergedHVs = hv1Remap.map((item1: any) => {
      const item2 = hv2Remap?.find((item: any) => item.Date === item1.Date);
      return {
        ...item1,
        ...(item2 || {}),
        ETotal: item1.differentHV1 + (item2?.differentHV2 ?? 0),
      };
    });
    const mappedResult = mergedHVs.map((item: any) => {
      return {
        value: item.ETotal,
        DateTime: item.Date,
      };
    });
    return this.curveService.buildCurveWithOneValue(mappedResult);
  }

  async fetchSantralEnergyTodayAllValueMonthly(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildIonMeterEnergyTodayMonthlyQuery(
      range,
      engParameter,
    );
    const result = await this.elasticService.search(plantIndex, elasticQuery);
    const ionDeviceResult = result.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'ION METER',
    ).by_month.buckets;
    const mappedResults: IMappedAllValueResult = ionDeviceResult.map(
      (item: any) => {
        return {
          DateTime: item.key_as_string,
          value:
            item.last_value.hits.hits[0]._source[engParameter] -
            item.first_value.hits.hits[0]._source[engParameter],
        };
      },
    );
    return mappedResults;
  }
  async fetchSantralEnergyTodayAllValueCustom(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ): Promise<IMappedAllValueResult> {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildIonMeterEnergyTodayCustomQuery(
      range,
      engParameter,
    );
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const eIon = response.aggregations.avgEnergies.buckets
      .find((item: any) => item.key === 'ION METER')
      .by_custom.buckets?.map((item: any) => {
        return {
          date: item.key_as_string,
          avgHV1: item?.avg_energy?.hits?.hits[0]?._source[engParameter] ?? 0,
        };
      });
    const midnightIonEnergy = response.aggregations.midnightValues.buckets
      .find((item: any) => item.key === 'ION METER')
      .by_day.buckets.map((item: any) => {
        return {
          date: item.key_as_string,
          midnightEnergyHV1:
            item.first_energy_value.hits.hits[0]._source[engParameter] ?? 0,
        };
      });
    const mergedMidnight = mergeByDateMidnight(midnightIonEnergy, []);
    const mergedEnergy = mergeByDate(eIon, []);
    const matchEnergies = findMidnightValues(mergedEnergy, mergedMidnight);
    const mappedResult = matchEnergies.map((item) => {
      return {
        value:
          (item.totalEnergy ?? 0) - (item.midnight.totalMidnightEnergy ?? 0),
        DateTime: item.date,
      };
    });
    return mappedResult;
  }
  async fetchSantralEnergyTodayAllValueDaily(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildIonMeterEnergyTodayDailyQuery(
      range,
      engParameter,
    );
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const ionResult = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'ION METER',
    ).by_day.buckets;
    // return ionResult
    const mappedResult: IMappedAllValueResult = ionResult.map((item: any) => {
      return {
        DateTime: item.key_as_string,
        value:
          item.last_value.hits.hits[0]._source[engParameter] -
          item.first_value.hits.hits[0]._source[engParameter],
      };
    });
    return mappedResult;
    // return this.curveService.buildCurveWithOneValue(
    //   mappedResult,
    //   MaskFunctionsEnum.MultiplyByThousand
    // );
  }
  async fetchSantralEnergyTodayAllValueYearly(
    plantIndex: string,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { range } = setTimeRange(dateDetails);
    const elasticQuery = buildIonMeterEnergyTodayYearlyQuery(
      range,
      engParameter,
    );

    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const ionDeviceResult = response.aggregations.by_device.buckets.find(
      (item: any) => item.key === 'ION METER',
    ).by_year.buckets;
    // return hv1
    const mappedResult: IMappedAllValueResult = ionDeviceResult.map(
      (item: any) => {
        return {
          DateTime: item.key_as_string,
          value:
            item.last_value.hits.hits[0]._source[engParameter] -
            item.first_value.hits.hits[0]._source[engParameter],
        };
      },
    );
    return mappedResult;
  }

  async fetchStringPlantSmartLoggerEnergyAfterLossessCustom(
    plantId: number,
    entity: EntityModel,
    plantIndex: string,
    dateDetails: IDateDetails,
  ) {
    try {
      const { range } = setTimeRange(dateDetails);
      const { entityTag } = entity;
      const [, substation, deviceName] = entityTag.split(':');
      const key = this.sourceService.mapSubToKeyWithSources(
        plantId,
        substation,
      );
      const logFilePrefix = '*' + key + '*';
      const elasticQuery = buildEnergyTodayWithoutLossesCustomQuery(
        deviceName,
        logFilePrefix,
        range,
      );
      const response = await this.elasticService.search(
        plantIndex,
        elasticQuery,
      );
      const mappedResult: IMappedAllValueResult =
        response.aggregations.by_sub.buckets[0]?.by_device.buckets[0].intervals.buckets.map(
          (obj: any) => {
            return {
              DateTime: obj.key_as_string,
              value: parseFloat(obj['E-Daily'].value),
            };
          },
        );
      return this.curveService.buildCurveWithOneValue(mappedResult);
    } catch (err) {
      console.log(err);
      return [];
    }
  }
  async fetchStringPlantSmartLoggerEnergyAfterLossessDaily(
    plantId: number,
    entity: EntityModel,
    plantIndex: string,
    dateDetails: IDateDetails,
  ) {
    const { entityTag } = entity;
    const { range } = setTimeRange(dateDetails);
    const [, substation, deviceName] = entityTag.split(':');
    const key = this.sourceService.mapSubToKeyWithSources(plantId, substation);
    const logFilePrefix = '*' + key + '*';
    const elasticQuery = buildEnergyTodayWithoutLossesDailyQuery(
      deviceName,
      logFilePrefix,
      range,
    );
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const mappedResult: IMappedAllValueResult =
      response.aggregations.by_sub.buckets[0].by_device.buckets[0].intervals.buckets.map(
        (obj: any) => {
          return {
            DateTime: obj.key_as_string,
            value: parseFloat(obj['E-Daily'].value),
          };
        },
      );
    return this.curveService.buildCurveWithOneValue(
      mappedResult,
      MaskFunctionsEnum.NumberStringToNFixedNumber,
    );
  }
  async fetchStringPlantSmartLoggerEnergyAfterLossessMonthly(
    plantId: number,
    entity: EntityModel,
    plantIndex: string,
    dateDetails: IDateDetails,
  ) {
    const { entityTag } = entity;
    const { range } = setTimeRange(dateDetails);
    const tag = entityTag.split(':');
    const [, substation, deviceName] = tag;
    const key = this.sourceService.mapSubToKeyWithSources(plantId, substation);
    const logFilePrefix = '*' + key + '*';
    const elasticQuery = buildEnergyTodayWithoutLossesMonthlyQuery(
      deviceName,
      logFilePrefix,
      range,
    );
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const eTotal: IMappedAllValueResult =
      response.aggregations.by_sub.buckets[0].by_device.buckets[0].by_month.buckets.map(
        (item: any) => {
          return {
            DateTime: item.key_as_string,
            value:
              (item.last_value.hits.hits[0]._source['E-Total'] ?? 0) -
              (item.first_value.hits.hits[0]._source['E-Total'] ?? 0),
          };
        },
      );
    return this.curveService.buildCurveWithOneValue(
      eTotal,
      MaskFunctionsEnum.NumberStringToNFixedNumber,
    );
  }
  async fetchStringPlantSmartLoggerEnergyAfterLossessYearly(
    plantId: number,
    entity: EntityModel,
    plantIndex: string,
    dateDetails: IDateDetails,
  ) {
    const { entityTag } = entity;
    const { range } = setTimeRange(dateDetails);
    const [, substation, deviceName] = entityTag.split(':');
    // const sources = await this.sourceService.readByPlantId(plantId);
    const key = this.sourceService.mapSubToKeyWithSources(plantId, substation);
    const logFilePrefix = '*' + key + '*';
    const elasticQuery = buildEnergyTodayWithoutLossesYearlyQuery(
      deviceName,
      logFilePrefix,
      range,
    );
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const data =
      response.aggregations.by_sub.buckets[0].by_device.buckets[0].by_month
        .buckets;

    const E_total_Data = data.map((item: any) => {
      return {
        Date: item.key_as_string,
        differentE:
          (item.last_value.hits.hits[0]._source['E-Total'] ?? 0) -
          (item.first_value.hits.hits[0]._source['E-Total'] ?? 0),
      };
    });
    return E_total_Data;
  }

  async fetchSantralPlantSmartLoggerEnergyAfterLossessMonthlyAndYearly(
    plantId: number,
    entity: EntityModel,
    plantIndex: string,
    dateDetails: IDateDetails,
  ) {
    try {
      const { range, date_histogram } = setTimeRange(dateDetails);
      const { entityTag } = entity;
      const tag = entityTag.split(':');
      const deviceName = tag[2];
      const key = await this.sourceService.mapSubToKeyWithSources(
        plantId,
        tag[1],
      );
      const elasticQuery =
        buildIonEnergyTodayWithoutLossesMonthlyAndYearlyQuery(
          deviceName,
          key,
          date_histogram,
          range,
        );
      // return elasticQuery
      const response = await this.elasticService.search(
        plantIndex,
        elasticQuery,
      );
      const mappedResult: IMappedAllValueResult =
        response.aggregations.by_device.buckets[0].by_year.buckets.map(
          (item: any) => {
            return {
              Date: item.key_as_string,
              value:
                item.last_value.hits.hits[0]._source['AC_energy_fed_in'] -
                item.first_value.hits.hits[0]._source['AC_energy_fed_in'],
            };
          },
        );

      return this.curveService.buildCurveWithOneValue(
        mappedResult,
        MaskFunctionsEnum.NumberStringToNFixedNumber,
      );
    } catch (err) {
      console.log(err);
      return [];
    }
  }
  async fetchSantralPlantSmartLoggerEnergyAfterLossessCustomAndDaily(
    plantId: number,
    entity: EntityModel,
    plantIndex: string,
    dateDetails: IDateDetails,
  ) {
    const { entityTag } = entity;
    const [, substation, deviceName] = entityTag.split(':');
    const key = this.sourceService.mapSubToKeyWithSources(plantId, substation);
    const logFilePrefix = '*' + key + '*';
    const { range, date_histogram } = setTimeRange(dateDetails);
    const elasticQuery = {
      _source: {
        includes: ['DateTime', 'AC_energy_fed_in_that_day'],
      },
      query: {
        bool: {
          must: [
            {
              match: {
                DeviceName: deviceName,
              },
            },
            {
              wildcard: {
                'log.file.path.keyword': logFilePrefix,
              },
            },
            {
              range: range,
            },
          ],
        },
      },
      size: 1,
      aggs: {
        daily_data: {
          date_histogram: date_histogram,
          aggs: {
            avg_power: {
              avg: {
                field: 'AC_energy_fed_in_that_day',
              },
            },
          },
        },
      },
    };
    const result = await this.elasticService.search(plantIndex, elasticQuery);
    const mappedResult: IMappedAllValueResult =
      result.aggregations.daily_data.buckets.map((item: any) => {
        return {
          DateTime: item.key_as_string,
          value: item.avg_power?.value ?? 0,
        };
      });
    return this.curveService.buildCurveWithOneValue(
      mappedResult,
      MaskFunctionsEnum.NumberStringToNFixedNumber,
    );
  }

  async fetchMVEnergyTodayAllValueMonthly(
    plantIndex: string,
    entity: EntityModel,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { entityTag } = entity;
    const { range } = setTimeRange(dateDetails);
    const tag = entityTag.split(':');
    const deviceName = tag[2];
    const elasticQuery = buildEnergyTodayWithLossesMonthlyQuery(
      deviceName,
      range,
      engParameter,
    );
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const MV = response.aggregations.by_device.buckets.find((item: any) =>
      item.key.includes(deviceName),
    ).by_month.buckets;

    const MVRemap = MV.map((item: any) => {
      return {
        DateTime: item.key_as_string,
        value:
          (item.last_value.hits.hits[0]._source[engParameter] ?? 0) -
          (item.first_value.hits.hits[0]._source[engParameter] ?? 0),
      };
    });
    return this.curveService.buildCurveWithOneValue(
      MVRemap,
      MaskFunctionsEnum.NumberStringToNFixedNumber,
    );
  }
  async fetchMVEnergyTodayAllValueCustom(
    plantIndex: string,
    entity: EntityModel,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { entityTag } = entity;
    const { range } = setTimeRange(dateDetails);
    const tag = entityTag.split(':');
    const deviceName = tag[2];
    const elasticQuery = buildEnergyTodayWithLossesCustomQuery(
      deviceName,
      range,
      engParameter,
    );
    // return elasticQuery
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    // return response
    const MV = response.aggregations.avgEnergies.buckets
      .find((item: any) => item.key.includes(deviceName))
      .by_custom.buckets.map((item: any) => {
        return {
          date: item.key_as_string,
          avgMV: item.avg_energy.hits.hits[0]._source[engParameter],
        };
      });

    const midnightMV = response.aggregations.midnightValues.buckets
      .find((item: any) => item.key.includes(deviceName))
      .by_day.buckets.map((item: any) => {
        return {
          date: item.key_as_string,
          midnightEnergyMV:
            item.first_energy_value.hits.hits[0]._source[engParameter],
        };
      });
    const mappedResult: IMappedAllValueResult = MV.map((obj: any) => {
      const match = midnightMV[0].midnightEnergyMV;
      const realEnergy = obj.avgMV - match;
      return {
        DateTime: obj.date,
        value: realEnergy,
      };
    });
    return this.curveService.buildCurveWithOneValue(
      mappedResult,
      MaskFunctionsEnum.NumberStringToNFixedNumber,
    );
  }
  async fetchMVEnergyTodayAllValueDaily(
    plantIndex: string,
    entity: EntityModel,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { entityTag } = entity;
    const { range } = setTimeRange(dateDetails);
    const tag = entityTag.split(':');
    const deviceName = tag[2];
    const elasticQuery = buildEnergyTodayWithLossesDailyQuery(
      deviceName,
      range,
      engParameter,
    );
    // return elasticQuery
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const MV = response.aggregations.by_device.buckets.find((item: any) =>
      item.key.includes(deviceName),
    ).by_day.buckets;

    const MVRemap: IMappedAllValueResult = MV.map((item: any) => {
      return {
        DateTime: item.key_as_string,
        value:
          (item.last_value.hits.hits[0]?._source[engParameter] ?? 0) -
          (item.first_value.hits.hits[0]?._source[engParameter] ?? 0),
      };
    });
    return this.curveService.buildCurveWithOneValue(MVRemap, [
      MaskFunctionsEnum.NumberStringToNFixedNumber,
    ]);
  }
  async fetchMVEnergyTodayAllValueYearly(
    plantIndex: string,
    entity: EntityModel,
    dateDetails: IDateDetails,
    engParameter: string,
  ) {
    const { entityTag } = entity;
    const { range } = setTimeRange(dateDetails);
    const tag = entityTag.split(':');
    const deviceName = tag[2];
    const elasticQuery = buildEnergyTodayWithLossesYearlyQuery(
      deviceName,
      range,
      engParameter,
    );
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    const MV = response.aggregations.by_device.buckets.find((item: any) =>
      item.key.includes(deviceName),
    ).by_year.buckets;

    const MVRemap: IMappedAllValueResult = MV.map((item: any) => {
      return {
        DateTime: item.key_as_string,
        value:
          (item.last_value.hits.hits[0]._source[engParameter] ?? 0) -
          (item.first_value.hits.hits[0]._source[engParameter] ?? 0),
      };
    });
    return this.curveService.buildCurveWithOneValue(MVRemap);
  }
}
