import { Expose, Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';

export class EntityIdDto {
  @Expose({ name: 'entityUuid' })
  @IsNotEmpty()
  @IsUUID()
  entity_id: string;
}
