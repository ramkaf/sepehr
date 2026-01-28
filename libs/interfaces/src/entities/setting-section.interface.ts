import { ISettings } from './setting.interface';

export interface ISettingSection {
  uuid: string;

  id: number;

  title: string;

  description: string;

  section: ISettings;
}
