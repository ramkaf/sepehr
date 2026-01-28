import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlarmConfig } from 'libs/database';
import {
  CreateAlarmConfigDto,
  PlantUuidDto,
  UpdateAlarmConfigDto,
  UuidDto,
} from 'libs/dtos';
import { BaseService } from '../../common/providers/base.service';
import { PlantService } from '../../../insight';

@Injectable()
export class AlarmConfigService extends BaseService<AlarmConfig> {
  constructor(
    @InjectRepository(AlarmConfig)
    private readonly alarmConfigRepository: Repository<AlarmConfig>,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
  ) {
    super(alarmConfigRepository, 'Alarm Config');
  }
  async getPlantAlarmConfigs(
    plantUuidDto: PlantUuidDto,
  ): Promise<AlarmConfig[]> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const alarmConfigs = await this.alarmConfigRepository.find({
      where: { plantId: plant.eId },
    });
    return alarmConfigs;
  }
  async add(createAlarmConfigDto: CreateAlarmConfigDto): Promise<AlarmConfig> {
    const { plantUuid, ...rest } = createAlarmConfigDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.create({
      ...rest,
      plant,
    });
  }
  async modify(
    updateAlarmConfigDto: UpdateAlarmConfigDto,
  ): Promise<AlarmConfig> {
    const { uuid, ...updateData } = updateAlarmConfigDto;
    return await this.update(uuid, updateData);
  }
  async remove(uuidDTO: UuidDto): Promise<boolean> {
    const { uuid } = uuidDTO;
    await this.destroy(uuid);
    return true;
  }
}
