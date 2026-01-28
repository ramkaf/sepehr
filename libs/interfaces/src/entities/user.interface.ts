import { IEntityModel } from './entity.interface';
import { OtpMethodEnum } from 'libs/enums';
import { IRole } from './role.interface';
import { IUserComponentsConfig } from './user-component.interface';
import { IAccessType } from './access-type.interface';
import { IUserEntityAssignment } from './plant-user.interface';
import { IBookmarkField } from './bookmark.interface';
import { IUserChart } from './user-chart.interface';
import { ISoiling } from './soiling.interface';
import { ICollectionEntity } from './collection.interface';

export interface IUser {
  id: number;

  firstName?: string;
  lastName?: string;

  email: string;
  username: string;

  mobile: string | null;

  password?: string;

  haveSmsAlert: boolean;

  lastLogin: Date;

  isActive: boolean;

  otpMethod: OtpMethodEnum;

  role: IRole | null;

  entities: IEntityModel[];

  userComponentsConfigs: IUserComponentsConfig[];

  userCharts: IUserChart[];

  bookmarkFields: IBookmarkField[];

  soilingRecords: ISoiling[];

  collections: ICollectionEntity[];

  fullName: string;

  accessType: IAccessType | null;

  uuid: string;

  twoFactorSecret: string | null;

  twoFactorEnabled: boolean;

  otpPath: string;

  oldRole: string;

  entityAssignments: IUserEntityAssignment[];
}
