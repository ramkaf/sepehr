import { Injectable, BadRequestException } from '@nestjs/common';
import { MaskFunctionsEnum } from 'libs/enums';
import { IBrowserLastValueResponse } from '../../interfaces/base.service.interface';
import { MaskFunctionCoreService } from './mask-function-core.service';

@Injectable()
export class MaskFunctionService {
  constructor(
    private readonly mockFunctionCoreService: MaskFunctionCoreService,
  ) {}
  // === Dynamic Executor ===
  execute(funcNames: MaskFunctionsEnum[], value: number | string): any {
    try {
      let maskedValue = value;

      funcNames.forEach((funcName: MaskFunctionsEnum) => {
        const func = (this.mockFunctionCoreService as any)[funcName];
        if (typeof func === 'function') {
          maskedValue = func(maskedValue); // use updated maskedValue
        } else {
          throw new BadRequestException(
            `Mask function '${funcName}' not found`,
          );
        }
      });

      return maskedValue; // return final masked result
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  executeMultipleMaskFunctions(
    funcNames: MaskFunctionsEnum[],
    value: number | string,
  ): any {
    try {
      let maskedValue = value;

      funcNames.forEach((func: MaskFunctionsEnum) => {
        const maskFn = (this.mockFunctionCoreService as any)[func];
        if (typeof maskFn === 'function') {
          console.log({ maskedValue });
          maskedValue = maskFn(maskedValue);
          console.log({ maskedValue });
        } else {
          throw new Error(
            `Mask function "${func}" is not defined in mockFunctionCoreService`,
          );
        }
      });

      return maskedValue;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  mask(
    value: any,
    maskFunctions:
      | MaskFunctionsEnum
      | (MaskFunctionsEnum | null)[]
      | null = null,
  ): string | number {
    if (!maskFunctions) return value;

    // Normalize into array and remove null/undefined values
    const masks = (
      Array.isArray(maskFunctions) ? maskFunctions : [maskFunctions]
    ).filter((fn): fn is MaskFunctionsEnum => fn != null);

    if (value === undefined || value === null) {
      return NaN;
    }

    // If all masks were null → no transformation, return original
    if (masks.length === 0) {
      return value;
    }

    return this.execute(masks, value);
  }
  maskBrowserParametersLastValues(parameters: IBrowserLastValueResponse[]) {
    return parameters.map((item) => {
      if (!item.maskFunction) return item;
      return {
        ...item,
        value: item.value ? this.execute([item.maskFunction], item.value) : NaN,
      };
    });
  }
}
