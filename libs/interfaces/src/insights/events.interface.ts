export interface IEventResult {
  id: number;
  sourceStr: string;
  sourceTitle: string;
  startDate: string; // This will be in Iran timezone
  receptionDate: string;
  alarmsDelay: number;
  energyLosses: number;
  acknowledgeDate: Date | null;
  acknowledgeComment: string | null;
  acknowledgeStatus: string | null;
  status: string;
  stateStr: string;
  severityStr: string;
  descriptionStr: string;
  fullName: string | null; // Could be null due to LEFT JOIN
}

export interface IEventResponse extends IEventResult {
  duration: number;
  site: string;
  strDuration: string;
}
