import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantType, PostgresModule, RedisModule } from 'libs/database';
import { InsightModule } from '../../insight';
import { PlantTypeService } from './providers/plant-type.service';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([PlantType]),
    RedisModule,
    forwardRef(() => InsightModule),
  ],
  providers: [PlantTypeService],
  exports: [PlantTypeService],
})
export class PlantTypeModule {}
