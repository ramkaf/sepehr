import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';
import { ProvinceService } from './providers/province.service';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([Province]),
    RedisModule,
    forwardRef(() => InsightModule),
  ],
  providers: [ProvinceService],
  exports: [ProvinceService],
})
export class ProvinceModule {}
