import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaintenanceHistory } from 'libs/database';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { EntityBaseService } from '../../entity/providers/entity.base.service';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class MaintenanceHistoryService extends BaseService<MaintenanceHistory> {
  constructor(
    @InjectRepository(MaintenanceHistory)
    private readonly maintenanceHistoryRepository: Repository<MaintenanceHistory>,
    private readonly entityService: EntityBaseService,
  ) {
    super(maintenanceHistoryRepository, 'maintenance history');
  }
  async fetch(entity_id: string) {
    const entity = await this.entityService.findOne(entity_id);
    if (!entity) throw new NotFoundException(ERROR_MESSAGES.ENTITY_NOT_FOUND);
    return await this.maintenanceHistoryRepository
      .createQueryBuilder('mh')
      .leftJoin('mh.previous_step', 'prev_ms')
      .leftJoin('mh.new_step_id', 'new_ms')
      .leftJoin('mh.acknowledged_By', 'u')
      .select([
        'mh.mh_id AS mh_id',
        'mh.entity_id AS entity_id',
        'mh.datetime AS datetime',
        'mh.description AS description',

        'mh.previous_step_id AS previous_step_id',
        'prev_ms.step_name AS previous_step',

        'mh.newStepId AS new_step_id',
        'new_ms.step_name AS new_step',
      ])
      .addSelect(
        `
    CASE 
      WHEN u."firstName" IS NOT NULL AND u."lastName" IS NOT NULL 
        THEN u."firstName" || ' ' || u."lastName"
      WHEN u."firstName" IS NOT NULL 
        THEN u."firstName"
      WHEN u."lastName" IS NOT NULL 
        THEN u."lastName"
      ELSE NULL
    END
  `,
        'acknowledged_by',
      )
      .where('mh.entity_id = :entity_id', { entity_id })
      .orderBy('mh.datetime', 'DESC')
      .getRawMany();
  }
}
