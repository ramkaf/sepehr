import { IsString, MaxLength, IsObject, IsNotEmpty } from 'class-validator';
import { PlantUuidDto, UuidOptioanlDTO } from '../generals-uuid';
import { IntersectionType } from '@nestjs/mapped-types';

export class UpsertSchematicDto extends IntersectionType(
  PlantUuidDto,
  UuidOptioanlDTO,
) {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  title: string;

  @IsObject()
  @IsNotEmpty()
  metadata: Record<string, any>;
}
