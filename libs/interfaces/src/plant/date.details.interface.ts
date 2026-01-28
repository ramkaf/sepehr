export enum PeriodEnum {
  C = 'C',
  D = 'D',
  M = 'M',
  Y = 'Y',
  Default = 'default',
}

export interface IDateDetailRequest {
  period: PeriodEnum;
  begin_range: string;
  end_range: string;
}

export interface IDateDetails {
  mode: PeriodEnum;
  startDate: string | null;
  endDate: string | null;
}

export interface IRangeQuery {
  DateTime: {
    gte: string;
    lte: string;
    time_zone: string;
  };
}

export interface IDateHistogram {
  field: string;
  time_zone: string;
  fixed_interval?: string;
  calendar_interval?: string;
}

export interface TimeRangeResult {
  range: IRangeQuery;
  date_histogram: IDateHistogram;
  date_histogram_midnight: IDateHistogram;
}
