import { IDaylightMappingProfile } from '../interfaces/day-light-mapping.interface';

export const PLANT_DAYLIGHT_MAPPINGS: IDaylightMappingProfile[] = [
  {
    plantTag: 'jarghoyeh',
    field: 'P_total',
    operator: 'lt',
    threshold: 0,
    deviceNames: ['HV1 POWER METER OUT 1', 'HV1 POWER METER OUT 2'],
  },
  {
    plantTag: 'jarghoyeh1',
    field: 'I_avg',
    operator: 'gt',
    threshold: 0,
    deviceNames: ['ION METER'],
  },
  {
    plantTag: 'jarghoyeh3',
    field: 'P_total',
    operator: 'lt',
    threshold: 0,
    deviceNames: ['HV1 POWER METER OUT 1'],
  },
  {
    plantTag: 'mehriz',
    field: 'P_total',
    operator: 'lt',
    threshold: 0,
    deviceNames: ['HV1 POWER METER OUT 1', 'HV1 POWER METER OUT 2'],
  },
  {
    plantTag: 'qom',
    field: 'P_total',
    operator: 'lt',
    threshold: 0,
    deviceNames: ['HV1 POWER METER OUT 1', 'HV1 POWER METER OUT 2'],
  },
  {
    plantTag: 'koshk1',
    field: 'P_total',
    operator: 'lt',
    threshold: 0,
    deviceNames: ['HV1 POWER METER OUT 1 ', 'HV1 POWER METER OUT 2'],
  },
  {
    plantTag: 'koshk2',
    field: 'P_total',
    operator: 'lt',
    threshold: 0,
    deviceNames: ['HV1 POWER METER OUT 1'],
  },
  {
    plantTag: 'baft1',
    field: 'P_total',
    operator: 'lt',
    threshold: 0,
    deviceNames: ['HV1 POWER METER OUT 1', 'HV1 POWER METER OUT 2'],
  },
];
export const DEFAULT_DAYLIGHT_MAPPING: IDaylightMappingProfile = {
  plantTag: '',
  field: 'P_total',
  operator: 'lt',
  threshold: 0,
  deviceNames: ['HV1 POWER METER OUT 1 ', 'HV1 POWER METER OUT 2'],
};
