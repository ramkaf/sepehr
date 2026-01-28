import { Injectable } from '@nestjs/common';
import { DeviceTagMapping, EntityType } from 'libs/database';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MaintenanceDevicesTagMappingService extends BaseService<DeviceTagMapping> {
  constructor(
    @InjectRepository(DeviceTagMapping)
    private readonly deviceTagMappingRepository: Repository<DeviceTagMapping>,
    @InjectRepository(EntityType)
    private readonly entityTypeRepository: Repository<EntityType>,
  ) {
    super(deviceTagMappingRepository, 'maintenance devices tag mapping');
  }

  async fetchEntityTypeMaintenanceDevicesTagMapping(entityTypeIds: number[]) {
    const results = await this.entityTypeRepository.find({
      where: {
        etId: In(entityTypeIds),
      },
      relations: {
        deviceTagMappings: true,
      },
    });
    const mapResult = new Map();
    results.forEach((result) => {
      const { deviceTagMappings } = result;
      deviceTagMappings.forEach((obj) => {
        mapResult.set(result.etId, {
          model_tag: obj.model_tag,
          sn_tag: obj.sn_tag,
          pn_tag: obj.pn_tag,
        });
      });
    });
    return mapResult;
  }
}
