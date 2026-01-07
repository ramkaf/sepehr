import { Module } from '@nestjs/common';
import { NestConfigModule } from 'libs/config';
import { ElasticModule, PostgresModule, RedisModule } from 'libs/database';
import { PlantServiceFactory } from './providers/plant/power-plant-service.factory';
import { Jarghoyeh1Service } from './power-plant-custom-services/jarghoyeh1.service';
import { Jarghoyeh3Service } from './power-plant-custom-services/jarghoyeh3.service';
import { JarghoyehService } from './power-plant-custom-services/jarghoyeh.service';
import { Koshk1Service } from './power-plant-custom-services/koshk1.service';
import { Koshk2Service } from './power-plant-custom-services/koshk2.service';
import { QomService } from './power-plant-custom-services/qom.service';
import { MehrizService } from './power-plant-custom-services/mehriz.service';
import {
  EntityFieldsModule,
  EntityModule,
  EntityTypesModule,
  SourceModule,
} from '../entity-management';
import { NonComputationalService } from './providers/parameters/non-computational-parameters.service';
import { InsightModule } from '../insight';
import { StaticParameterService } from './providers/parameters/static-parameters.service';
import { ComputationalParameterService } from './providers/parameters/computional-parameters.service';
import { MaskFunctionService } from './providers/mask-functions/mask-function.service';
import { MaskFunctionCoreService } from './providers/mask-functions/mask-function-core.service';
import { CurveModelService } from './providers/curve/curve.factory.service';
import { EnergyService } from './power-plant-custom-services/energy.service';
import { PlantDayLightService } from './providers/day-light/day-light.service';
import { Baft1Service } from './power-plant-custom-services/baft1.service';

@Module({
  imports: [
    NestConfigModule,
    PostgresModule,
    ElasticModule.register(),
    RedisModule,
    SourceModule,
    InsightModule,
    EntityModule,
    EntityFieldsModule,
    EntityTypesModule,
  ],
  providers: [
    NonComputationalService,
    PlantServiceFactory,
    StaticParameterService,
    ComputationalParameterService,
    MaskFunctionService,
    MaskFunctionCoreService,
    CurveModelService,
    Jarghoyeh1Service,
    Jarghoyeh3Service,
    JarghoyehService,
    Koshk1Service,
    Koshk2Service,
    QomService,
    Baft1Service,
    MehrizService,
    EnergyService,
    PlantDayLightService,
  ],
  exports: [
    NonComputationalService,
    StaticParameterService,
    ComputationalParameterService,
    CurveModelService,
    PlantServiceFactory,
    MaskFunctionService,
    MaskFunctionCoreService,
    Jarghoyeh1Service,
    Jarghoyeh3Service,
    JarghoyehService,
    Koshk1Service,
    Koshk2Service,
    QomService,
    MehrizService,
    Baft1Service,
    EnergyService,
    PlantDayLightService,
  ],
})
export class PowerPlantServiceModule {}
