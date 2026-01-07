import { MaskFunctionsEnum } from 'libs/enums';

export interface IEntityFieldSchema {
  uuid: string;

  fieldTitle: string | null;
  fieldTag: string;

  unit: string | null;

  isComputational: boolean;

  lastValueFunctionName: string | null;
  allValuesFunctionName: string | null;

  isStatic: boolean;

  maskFunction: MaskFunctionsEnum | null;

  maxLength: string | null;
  minLength: string | null;

  isEnum: boolean;

  defaultValue: string | null;
}
