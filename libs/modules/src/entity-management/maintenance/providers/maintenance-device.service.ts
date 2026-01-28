import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeviceMaintenance } from 'libs/database';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { MaintenanceStepService } from './maintenance-step.service';
import { UserGlobalService } from '../../users/userGlobal.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityBaseService } from '../../entity/providers/entity.base.service';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class MaintenanceDeviceService extends BaseService<DeviceMaintenance> {
  constructor(
    @InjectRepository(DeviceMaintenance)
    private readonly maintenanceDeviceRepository: Repository<DeviceMaintenance>,
    private readonly maintenanceStepService: MaintenanceStepService,
    private readonly userGlobalService: UserGlobalService,
    private readonly entityService: EntityBaseService,
  ) {
    super(maintenanceDeviceRepository, 'device maintenance');
  }

  async fetchMaintenanceState(entityId: number) {
    return await this.maintenanceDeviceRepository
      .createQueryBuilder('dm')
      .leftJoin('dm.currentStep', 'ms')
      .select([
        'dm.dm_id',
        'dm.entity_id',
        'dm.current_step_id',
        'ms.step_name as current_step',
        'dm.media_id',
        'dm.updated_at',
        'dm.last_updated_by',
      ])
      .where('dm.entity_id = :entityId', { entityId })
      .getRawMany();
  }
  async fetchMaintenanceStates(entityIds: number[]) {
    return await this.maintenanceDeviceRepository
      .createQueryBuilder('dm')
      .leftJoin('dm.currentStep', 'ms')
      .select([
        'dm.dm_id',
        'dm.entity_id',
        'dm.current_step_id',
        'ms.step_name as current_step',
        'dm.media_id',
        'dm.updated_at',
        'dm.last_updated_by',
      ])
      .where('dm.entity_id IN (:...entityIds)', { entityIds })
      .getRawMany();
  }
  async upsert(
    entityId: string,
    currentStepUuid: string,
    lastUpdatedByUuid: string,
  ) {
    const current_step =
      await this.maintenanceStepService.findOne(currentStepUuid);
    if (!current_step)
      throw new NotFoundException('maintenance step is invalid');
    const last_updated =
      await this.userGlobalService.findOne(lastUpdatedByUuid);
    if (!last_updated) throw new NotFoundException('user uuid is invalid');
    const entity = await this.entityService.findOne(entityId);
    if (!entity)
      throw new NotFoundException(ERROR_MESSAGES.ENTITY_NOT_FOUND(entityId));
    await this.maintenanceDeviceRepository.upsert(
      {
        entity,
        current_step,
        last_updated,
      },
      ['entity'],
    );
    return true;
  }
}
