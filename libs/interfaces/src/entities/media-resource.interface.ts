export interface IMediaResource {
  id: number;

  mediaTag: string;

  mediaType: string;

  storageType: string;

  contentUrl?: string;
  contentInline?: string;
  contentIdentifier?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  uuid: string;
}
