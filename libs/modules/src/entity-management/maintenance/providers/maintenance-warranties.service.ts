import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Warranty } from 'libs/database';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { EntityBaseService } from '../../entity/providers/entity.base.service';
import { ERROR_MESSAGES } from 'libs/constants';
import {
  CreateDeviceWarrantyDto,
  UpdateDeviceWarrantyDto,
} from '@app/dtos/maintenance';

@Injectable()
export class MaintenanceWarrantiesService extends BaseService<Warranty> {
  constructor(
    @InjectRepository(Warranty)
    private readonly warrantyRepository: Repository<Warranty>,
    private readonly entityService: EntityBaseService,
  ) {
    super(warrantyRepository, 'maintenance warranties');
  }
  async addDeviceWarranty(
    entity_id: string,
    createDeviceWarrantyDto: CreateDeviceWarrantyDto,
  ) {
    const entity = await this.entityService.findOne(entity_id);
    if (!entity) throw new NotFoundException(ERROR_MESSAGES.ENTITY_NOT_FOUND);
    const warrantySchema = this.warrantyRepository.create({
      entity,
      ...createDeviceWarrantyDto,
    });
    const warranty = await this.warrantyRepository.save(warrantySchema);
    return {
      ...warranty,
      device_name: entity.entityName,
      device_tag: entity.entityTag,
    };
  }
  async fetchDeviceWarranty(entity_id: string) {
    const entity = await this.entityService.findOne(entity_id);
    if (!entity) throw new NotFoundException(ERROR_MESSAGES.ENTITY_NOT_FOUND);
    return await this.warrantyRepository.find({
      where: {
        entity,
      },
    });
  }
  async modify(
    entity_id: string,
    updateDeviceWarrantyDto: UpdateDeviceWarrantyDto,
  ) {
    const warranty = await this.warrantyRepository.findOne({
      where: {
        entity: {
          uuid: entity_id,
        },
      },
    });
    if (!warranty) throw new NotFoundException('warranty is not ');
    Object.assign(warranty, updateDeviceWarrantyDto);
    await this.warrantyRepository.save(warranty);
  }
}
