import { IEntityModel } from './entity.interface';

export interface IDocumentEntity {
  docId: string;

  version: number;

  realName: string;

  format: string;

  uploadDate: Date;
  updateDate?: Date;

  linkType: string;

  source: string;

  lastModifier: string;

  author: string;

  size: string;

  tags: string;

  isActive: boolean;

  plant: IEntityModel | null;

  uuid: string;
}
