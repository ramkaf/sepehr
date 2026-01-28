import { IntersectionType } from '@nestjs/mapped-types';
import { EntityTypeUuidDto, UuidDto } from '../generals-uuid';
import { SchematicUuidDto } from '../generals-uuid/schematic-uuid.dto';

export class AppendSchematicEntityTypeDto extends IntersectionType(
  EntityTypeUuidDto,
  SchematicUuidDto,
) {}
