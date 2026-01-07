/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import {
  IAllValuesServicesResult,
  IMappedAllValueResult,
} from 'libs/interfaces';
import { MaskFunctionsEnum } from 'libs/enums';
import { MaskFunctionService } from '../mask-functions/mask-function.service';
import { ICurve, ICurveModel } from '../../interfaces/curve.interface';

@Injectable()
export class CurveModelService {
  constructor(private readonly maskFunctionService: MaskFunctionService) {}

  private buildCurveObject(
    data: IAllValuesServicesResult,
    maskFunction: MaskFunctionsEnum | null,
  ): ICurveModel {
    const FullDate = data.DateTime;
    const Date = data.DateTime.substring(0, 10);
    const Time = data.DateTime.substring(11, 16);

    const AvgValue = this.maskFunctionService.mask(data.avg, maskFunction);

    const MaxValue = this.maskFunctionService.mask(data.max, maskFunction);

    const MinValue = this.maskFunctionService.mask(data.min, maskFunction);

    const CurrentValue = this.maskFunctionService.mask(
      data.current,
      maskFunction,
    );

    return { FullDate, Date, Time, AvgValue, MaxValue, MinValue, CurrentValue };
  }

  private buildCurveObjWithMultipleMasks(
    data: IAllValuesServicesResult,
    maskFunctions: MaskFunctionsEnum[],
  ): ICurveModel {
    const FullDate = data.DateTime;
    const Date = data.DateTime.substring(0, 10);
    const Time = data.DateTime.substring(11, 16);
    let AvgValue = data.avg;
    let MaxValue = data.max;
    let MinValue = data.min;
    let CurrentValue = data.current;

    maskFunctions.forEach((maskFunction: MaskFunctionsEnum) => {
      AvgValue = this.maskFunctionService.mask(AvgValue, maskFunction);

      MaxValue = this.maskFunctionService.mask(MaxValue, maskFunction);

      MinValue = this.maskFunctionService.mask(MinValue, maskFunction);

      CurrentValue = this.maskFunctionService.mask(CurrentValue, maskFunction);
    });

    return { FullDate, Date, Time, AvgValue, MaxValue, MinValue, CurrentValue };
  }

  public buildCurve(
    dataArray: IAllValuesServicesResult[],
    maskFunction: MaskFunctionsEnum | null,
  ): ICurve {
    return dataArray.map((data) => this.buildCurveObject(data, maskFunction));
  }

  public buildCurveWithBulkMasks(
    dataArray: IAllValuesServicesResult[],
    maskFunctions: MaskFunctionsEnum[] = [],
  ): ICurve {
    return dataArray.map((data) =>
      this.buildCurveObjWithMultipleMasks(data, maskFunctions),
    );
  }

  // public buildCurveWithOneValue(
  //   data: IMappedAllValueResult,
  //   maskFunction: MaskFunctionsEnum | null
  // ): ICurve {
  //   const mappedData: IAllValuesServicesResult[] = data.map((item: any) => {
  //     return {
  //       DateTime: item.DateTime,
  //       max: item.value,
  //       min: item.value,
  //       avg: item.value,
  //       current: item.value,
  //     };
  //   });
  //   return this.buildCurve(mappedData, maskFunction);
  // }

  public buildCurveWithOneValue(
    data: IMappedAllValueResult,
    maskFunctions:
      | MaskFunctionsEnum
      | (MaskFunctionsEnum | null)[]
      | null = null,
  ): ICurve {
    const mappedData: IAllValuesServicesResult[] = data.map((item: any) => {
      return {
        DateTime: item.DateTime,
        max: item.value,
        min: item.value,
        avg: item.value,
        current: item.value,
      };
    });
    if (!maskFunctions) return this.buildCurveWithBulkMasks(mappedData);
    const masks = Array.isArray(maskFunctions)
      ? maskFunctions
      : [maskFunctions];
    const removeNullMasks = masks.filter(
      (fn): fn is MaskFunctionsEnum => fn != null,
    );
    return this.buildCurveWithBulkMasks(mappedData, removeNullMasks);
  }
}
