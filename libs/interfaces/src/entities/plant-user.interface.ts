import { IUser } from './user.interface';
import { IEntityModel } from './entity.interface';

export interface IUserEntityAssignment {
  assignmentId: number;

  userId: number;
  entityId: number;

  assignmentDate: Date;

  assignedBy: number | null;

  user: IUser;

  entity: IEntityModel;

  assignor: IUser | null;
}
