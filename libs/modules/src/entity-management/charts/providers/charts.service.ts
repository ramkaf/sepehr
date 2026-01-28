import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chart } from 'libs/database';
import { CreateChartDto, UpdateChartDto, UuidDto } from 'libs/dtos';
import { Repository } from 'typeorm';
import { PlantService } from '../../../insight';
import { BaseService } from '../../common/providers/base.service';

@Injectable()
export class ChartService extends BaseService<Chart> {
  constructor(
    @InjectRepository(Chart)
    private readonly chartRepository: Repository<Chart>,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
  ) {
    super(chartRepository, 'Chart');
  }
  async add(createChartDto: CreateChartDto): Promise<Chart> {
    const { plantUuid, ...rest } = createChartDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.create({
      ...rest,
      plantId: plant.eId,
    });
  }
  async findPlantCharts(plantUuid: string): Promise<Chart[]> {
    const charts = await this.chartRepository.find({
      where: {
        plant: {
          uuid: plantUuid,
        },
      },
    });
    return charts;
  }
  async modify(updateChartDto: UpdateChartDto): Promise<Chart> {
    const { uuid, ...rest } = updateChartDto;
    return await this.update(uuid, rest);
  }
  async remove(uuidDto: UuidDto): Promise<boolean> {
    const { uuid } = uuidDto;
    await this.destroy(uuid);
    return true;
  }
}
