import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';
import { CompanyService } from './providers/company.service';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([Company]),
    RedisModule,
    forwardRef(() => InsightModule),
  ],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
