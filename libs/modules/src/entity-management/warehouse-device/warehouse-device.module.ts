import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseDevice } from 'libs/database';
import { WarehouseDeviceService } from './providers/warehouse-device.service';
import { CompanyWareHouseModule } from '../company-warehouse/company-warehouse.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WarehouseDevice]),
    CompanyWareHouseModule,
    CompanyModule,
  ],
  providers: [WarehouseDeviceService],
  exports: [WarehouseDeviceService],
})
export class WarehouseDevicesModules {}
