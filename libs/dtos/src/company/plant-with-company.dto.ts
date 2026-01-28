import { IntersectionType } from '@nestjs/mapped-types';
import { CompanyIdDto, PlantIdDto } from '../generals';

export class PlantWithCompanyDto extends IntersectionType(
  PlantIdDto,
  CompanyIdDto,
) {}
