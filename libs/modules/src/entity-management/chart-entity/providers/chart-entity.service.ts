import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChartEntity } from 'libs/database';
import {
  CreateChartEntityDto,
  CreateMultipleChartEntityDto,
  MultipleUuidDto,
  UuidDto,
} from 'libs/dtos';
import { Repository } from 'typeorm';
import { ChartDetailService } from '../../chart-detail/providers/chart-detail.service';
import { EntityBaseService } from '../../entity/providers/entity.base.service';
import { BaseService } from '../../common/providers/base.service';

@Injectable()
export class ChartEntityService extends BaseService<ChartEntity> {
  constructor(
    @InjectRepository(ChartEntity)
    private readonly chartEntityRepository: Repository<ChartEntity>,
    private readonly chartDetailService: ChartDetailService,
    private readonly entityBaseervice: EntityBaseService,
  ) {
    super(chartEntityRepository, 'Chart Entity');
  }

  async add(createChartEntityDto: CreateChartEntityDto): Promise<ChartEntity> {
    const { chdUuid, eUuid, chartEntityTitle } = createChartEntityDto;
    const entity = await this.entityBaseervice.findOne(eUuid);
    if (!entity)
      throw new BadRequestException(`EntityField with uuid ${eUuid} not found`);
    const chartDetail = await this.chartDetailService.findOne(chdUuid);
    if (!chartDetail)
      throw new BadRequestException(
        `chart detail with uuid ${chdUuid} not found`,
      );
    if (entity.etId !== chartDetail.etId)
      throw new BadRequestException(
        'The provided entity does not belong to the entity type that the chart detail is associated with',
      );
    return await this.create({
      chartEntityTitle,
      entity,
      chartDetail,
    });
  }
  async addMany(createMultipleChartEntityDto: CreateMultipleChartEntityDto) {
    return await Promise.all(
      createMultipleChartEntityDto.data.map(
        async (dto: CreateChartEntityDto) => {
          return await this.add(dto);
        },
      ),
    );
  }

  async remove(uuidDTO: UuidDto): Promise<boolean> {
    const { uuid } = uuidDTO;
    await this.destroy(uuid);
    return true;
  }
  async removeMany(multipleUuidDto: MultipleUuidDto): Promise<boolean> {
    await Promise.all(
      multipleUuidDto.data.map(async (uuidDTO: UuidDto) => {
        return await this.remove(uuidDTO);
      }),
    );
    return true;
  }
}
