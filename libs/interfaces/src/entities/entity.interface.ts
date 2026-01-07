import { IAlarmConfig } from './alarm-config.interface';
import { IChartEntity } from './chart-entity.interface';
import { IChart } from './chart.interface';
import { ICollectionEntity } from './collection.interface';
import { IDocumentEntity } from './document.interface';
import { IEntityType } from './entity-type.interface';
import { IFleetManager } from './fleet-manager.interface';
import { IUserEntityAssignment } from './plant-user.interface';
import { ISchematic } from './schematic.interface';
import { ISoilingEntities } from './soiling-entities.interface';
import { ISoiling } from './soiling.interface';
import { ISource } from './source.interface';
import { IUser } from './user.interface';

export interface IEntityModel {
  uuid: string;

  eId: number;

  entityName: string;
  entityTag: string;

  parentInTreeId: number | null;

  etId: number | null;

  entityType: IEntityType | null;

  entityTypes: IEntityType[];

  entityAssignments: IUserEntityAssignment[];

  users: IUser[];

  chartEntities: IChartEntity[];

  fleetManager: IFleetManager | null;

  alarmConfigs: IAlarmConfig[];

  collections: ICollectionEntity[];

  charts: IChart[];

  baseSoilings: ISoiling[];

  plantSoilings: ISoiling[];

  documents: IDocumentEntity[];

  sources: ISource[];

  schematics: ISchematic[];

  userAssignments: IUserEntityAssignment[];

  soilingEntities: ISoilingEntities[];
}
