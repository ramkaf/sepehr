import { BrowserGroupEnum } from 'libs/enums';

export interface ISearchEntityFieldDto {
  etUuid?: string;
  fieldTag?: string;
  isStatic?: boolean;
  isComputational?: boolean;
  fieldTagLike?: string;
  browserGroups?: BrowserGroupEnum[];
}
