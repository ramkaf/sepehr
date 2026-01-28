import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChartDetail, EntityType } from 'libs/database';
import {
  ChartUuidDto,
  CreateChartDetailDto,
  UpdateChartDetailDto,
  UuidDto,
} from 'libs/dtos';
import { Repository } from 'typeorm';
import { ChartService } from '../../charts/providers/charts.service';
import { EntityTypeBaseService } from '../../entity-types/providers/entity-type.base.service';
import { BaseService } from '../../common/providers/base.service';

@Injectable()
export class ChartDetailService extends BaseService<ChartDetail> {
  constructor(
    @InjectRepository(ChartDetail)
    private readonly chartDetailRepository: Repository<ChartDetail>,
    private readonly chartService: ChartService,
    private readonly entityTypeBaseService: EntityTypeBaseService,
  ) {
    super(chartDetailRepository, 'Chart Detail');
  }

  async add(createChartDetailDto: CreateChartDetailDto): Promise<ChartDetail> {
    const { chUuid, etUuid, ...rest } = createChartDetailDto;
    const chart = await this.chartService.findOne(chUuid);
    if (!chart)
      throw new BadRequestException(
        `the provided uuid : ${chUuid} for entity type is not valid`,
      );
    let entityType: EntityType | null = null;

    if (etUuid !== undefined) {
      entityType = await this.entityTypeBaseService.findOne(etUuid);

      if (!entityType)
        throw new BadRequestException(
          `the provided uuid : ${etUuid} for entity type is not valid`,
        );

      if (entityType.plantId !== null && entityType.plantId !== chart.plantId)
        throw new BadRequestException(
          `The provided entity type UUID "${etUuid}" does not belong to the plant associated with chart UUID "${chUuid}".`,
        );
    }

    return await this.create({
      ...rest,
      chart,
      entityType,
    });
  }
  async getChartDetails(chartUuidDto: ChartUuidDto): Promise<ChartDetail[]> {
    const { chUuid } = chartUuidDto;
    const chart = await this.chartService.findOne(chUuid);
    if (!chart)
      throw new BadRequestException(
        `the provided uuid : ${chUuid} is not valid`,
      );
    const chartDetails = await this.chartDetailRepository.find({
      where: { chart },
    });
    return chartDetails;
  }
  async modify(
    updateChartDetailDto: UpdateChartDetailDto,
  ): Promise<ChartDetail> {
    const { uuid } = updateChartDetailDto;
    return await this.update(uuid, updateChartDetailDto);
  }
  async remove(uuidDto: UuidDto): Promise<boolean> {
    const { uuid } = uuidDto;
    await this.destroy(uuid);
    return true;
  }
}
