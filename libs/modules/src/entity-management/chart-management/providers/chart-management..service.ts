import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chart, UserChart } from 'libs/database';
import {
  CreateChartDto,
  MultipleUuidDto,
  UpdateChartDto,
  UuidDto,
} from 'libs/dtos';
import { In, Repository } from 'typeorm';
import { PlantService } from '../../../insight';
import { BaseService } from '../../common/providers/base.service';
import { FetchPlantUserDependencyDto } from '@app/dtos/chart-management';

@Injectable()
export class ChartManagementService {
  constructor(
    @InjectRepository(Chart)
    private readonly chartRepository: Repository<Chart>,
    @InjectRepository(UserChart)
    private readonly userChartRepository: Repository<UserChart>,
  ) {}

  async fetchUserCharts(
    fetchPlantUserDependencyDto: FetchPlantUserDependencyDto,
  ) {
    const { plantUuid, userUuid } = fetchPlantUserDependencyDto;
    const result = await this.chartRepository.find({
      where: {
        plant: {
          uuid: plantUuid,
        },
        userCharts: {
          user: {
            uuid: userUuid,
          },
        },
      },
      relations: {
        userCharts: true,
      },
    });
    return result.map((item) => {
      const { userCharts, ...rest } = item;
      return { ...userCharts[0], ...rest };
    });
  }
  async deleteMultipleUserCharts(
    multipleUuidDto: MultipleUuidDto,
  ): Promise<void> {
    const { data } = multipleUuidDto;
    await this.userChartRepository.delete({
      uuid: In(data.map((item: UuidDto) => item.uuid)),
    });
  }
}
