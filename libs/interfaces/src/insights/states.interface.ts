export interface IStateResult {
  stateId: number;
  sourceStr: string;
  sourceTitle: string;
  startDate: string; // Iran timezone
  receptionDate: string;
  acknowledgeDate: Date | null;
  acknowledgeComment: string | null;
  acknowledgeStatus: string | null;
  status: string;
  stateStr: string;
  severiryStr: string;
  descriptionStr: string;
  ef_id: number;
  fullname: string | null;
}

export interface IStateResponse extends IStateResult {
  site: string;
}
