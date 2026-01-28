export interface ICurveModel {
  FullDate: string;
  Date: string;
  Time: string;
  AvgValue: number | string;
  MaxValue: number | string;
  MinValue: number | string;
  CurrentValue: number | string;
}

export type ICurve = ICurveModel[];
