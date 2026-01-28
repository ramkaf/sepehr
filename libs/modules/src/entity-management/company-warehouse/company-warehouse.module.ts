import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyWareHouseService } from './providers/company-warehouse.service';
import { CompanyWarehouse, Province } from 'libs/database';
import { CompanyModule } from '../company/company.module';
import { ProvinceModule } from '../province/province.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyWarehouse, Province]),
    CompanyModule,
    ProvinceModule,
  ],
  providers: [CompanyWareHouseService],
  exports: [CompanyWareHouseService],
})
export class CompanyWareHouseModule {}
