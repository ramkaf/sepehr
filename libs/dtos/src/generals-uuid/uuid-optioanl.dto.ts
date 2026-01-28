import { IsOptional, IsUUID } from 'class-validator';

export class UuidOptioanlDTO {
  @IsOptional()
  @IsUUID()
  uuid?: string;
}
