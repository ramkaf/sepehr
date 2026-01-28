import { IsOptional, IsUUID } from 'class-validator';
import { PlantUuidDto, UuidOptioanlDTO } from '../generals-uuid';
import { IntersectionType } from '@nestjs/mapped-types';

export class ReadAlarmConfigDto extends IntersectionType(
  UuidOptioanlDTO,
  PlantUuidDto,
) {}
