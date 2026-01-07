import { ISettingSection } from './setting-section.interface';

export enum SettingValueEnum {
  NUMBER = 'number',
  TEXT = 'string',
  BOOLEAN = 'boolean',
}

export interface ISettings {
  uuid: string;

  id: number;

  title: string;

  description: string;

  valueType: SettingValueEnum;

  section: ISettingSection;
}
