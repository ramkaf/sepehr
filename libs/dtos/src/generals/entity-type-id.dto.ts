import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class EntityTypeIdDto {
  @IsNotEmpty()
  @IsUUID()
  entity_type_id: string;
}

export class EntityTypeIdOptionalDto {
  @IsOptional()
  @IsUUID()
  entity_type_id?: string;
}
