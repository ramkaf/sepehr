// plant-service.factory.ts
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Koshk1Service } from '../../power-plant-custom-services/koshk1.service';
import { Jarghoyeh1Service } from '../../power-plant-custom-services/jarghoyeh1.service';
import { Jarghoyeh3Service } from '../../power-plant-custom-services/jarghoyeh3.service';
import { Koshk2Service } from '../../power-plant-custom-services/koshk2.service';
import { QomService } from '../../power-plant-custom-services/qom.service';
import { StringPlantService } from './string-plant.service';
import { MehrizService } from '../../power-plant-custom-services/mehriz.service';
import { JarghoyehService } from '../../power-plant-custom-services/jarghoyeh.service';
import { PlantServiceMap } from '../../interfaces/base.service.interface';

@Injectable()
export class PlantServiceFactory {
  private readonly plantServiceMap: PlantServiceMap = {
    jarghoyeh1: Jarghoyeh1Service,
    jarghoyeh: JarghoyehService,
    jarghoyeh3: Jarghoyeh3Service,
    koshk1: Koshk1Service,
    koshk2: Koshk2Service,
    qom: QomService,
    mehriz: MehrizService,
  };

  constructor(private readonly moduleRef: ModuleRef) {}
  async invokeMethod(
    plantName: string,
    functionName: string,
    ...args: any[]
  ): Promise<any> {
    const serviceClass = this.plantServiceMap[plantName.toLowerCase()];

    if (!serviceClass) {
      throw new Error(`Plant service not found for: ${plantName}`);
    }
    const serviceInstance = this.moduleRef.get(serviceClass, { strict: false });

    if (!serviceInstance) {
      throw new Error(`Failed to resolve service instance for: ${plantName}`);
    }

    const serviceAny = serviceInstance as any;

    // Check if the method exists
    if (typeof serviceAny[functionName] !== 'function') {
      throw new Error(
        `Method '${functionName}' not found on ${serviceClass.name}`,
      );
    }
    return await serviceAny[functionName](...args);
  }

  getPlantService(plantName: string): StringPlantService {
    const serviceClass = this.plantServiceMap[plantName.toLowerCase()];

    if (!serviceClass) {
      throw new Error(`Plant service not found for: ${plantName}`);
    }

    return this.moduleRef.get(serviceClass, { strict: false });
  }

  getAvailablePlants(): string[] {
    return Object.keys(this.plantServiceMap);
  }

  hasPlantService(plantName: string): boolean {
    return plantName.toLowerCase() in this.plantServiceMap;
  }
  // response(funcName:string){
  //   if (funcName.includes('Last'))
  //     return NaN
  //   if ()
  // }
}
