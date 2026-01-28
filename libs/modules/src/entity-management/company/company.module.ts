import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  FleetManager,
  PostgresModule,
  RedisModule,
  User,
} from 'libs/database';
import { CompanyService } from './providers/company.service';
import { UserModule } from 'src/user/user.module';
import { ProvinceModule } from '../province/province.module';
import { UserGlobalModule } from '../users/userGlobal.module';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([Company, FleetManager, User]),
    RedisModule,
    forwardRef(() => UserModule),
    ProvinceModule,
  ],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
