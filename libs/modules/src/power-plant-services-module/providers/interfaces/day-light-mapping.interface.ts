export interface IDaylightMappingProfile {
  plantTag: string;
  field: string;
  operator: 'lte' | 'lt' | 'gte' | 'gt';
  threshold: number;
  deviceNames: string[];
}
