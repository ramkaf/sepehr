import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaintenanceStep } from 'libs/database';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';

@Injectable()
export class MaintenanceStepService extends BaseService<MaintenanceStep> {
  constructor(
    @InjectRepository(MaintenanceStep)
    private readonly maintenancesRepository: Repository<MaintenanceStep>,
  ) {
    super(maintenancesRepository, 'maintenance steps');
  }

  async find(): Promise<MaintenanceStep[]> {
    return await this.maintenancesRepository.find({
      select: ['step_name', 'step_order', 'id'],
      order: {
        step_order: 'ASC',
      },
    });
  }
  async findByName(step_name: string): Promise<MaintenanceStep> {
    const result = await this.maintenancesRepository.findOne({
      where: {
        step_name,
      },
      select: ['step_name', 'step_order', 'id'],
    });
    if (!result)
      throw new NotFoundException(
        `${step_name} from maintenance steps not found`,
      );
    return result;
  }
}
