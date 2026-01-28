// export interface ICurve {
//   fullDate: string;
//   date: string;
//   time: string;
//   avgValue: number;
//   maxValue: number;
//   minValue: number;
//   currentValue?: number;
// }

export interface IAllValuesServicesResult {
  DateTime: string;
  avg: number | string;
  max: number | string;
  min: number | string;
  current: number | string;
}
