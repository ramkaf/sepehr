export interface IFleetManagerColumns {
  fmcId: number;

  columnTag: string;
  columnTitle: string;
  columnType: string;

  defaultVisible: boolean;
  displayOrder: number;
  isActive: boolean;
  isFixed: boolean;

  uuid: string;
}
