import {
  CompanyWarehouseIdDto,
  WarehouseDeviceIdDto,
} from '@app/dtos/generals';
import { IntersectionType } from '@nestjs/mapped-types';

export class WareHouseWithDeviceDto extends IntersectionType(
  WarehouseDeviceIdDto,
  CompanyWarehouseIdDto,
) {}
