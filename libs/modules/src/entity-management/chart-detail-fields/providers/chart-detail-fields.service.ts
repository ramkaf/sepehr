import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DetailField } from 'libs/database';
import {
  CreateChartDetailFieldDto,
  CreateMultipleChartDetailFieldDto,
  MultipleUuidDto,
  UpdateChartDetailFieldDto,
  UpdateMultipleChartDetailFieldDto,
  UuidDto,
} from 'libs/dtos';
import { Repository } from 'typeorm';
import { ChartDetailService } from '../../chart-detail/providers/chart-detail.service';
import { EntityFieldBaseService } from '../../entity-fields/providers/entity-fields.base.service';
import { BaseService } from '../../common/providers/base.service';

@Injectable()
export class ChartDetailFieldService extends BaseService<DetailField> {
  constructor(
    @InjectRepository(DetailField)
    private readonly chartDetailFieldRepository: Repository<DetailField>,
    private readonly chartDetailService: ChartDetailService,
    private readonly entityFieldBaseService: EntityFieldBaseService,
  ) {
    super(chartDetailFieldRepository, 'Chart Detail Fields');
  }

  async add(
    createChartDetailFieldDto: CreateChartDetailFieldDto,
  ): Promise<DetailField> {
    const { chdUuid, efUuid, ...rest } = createChartDetailFieldDto;
    const entityField = await this.entityFieldBaseService.findOne(efUuid);
    if (!entityField)
      throw new BadRequestException(
        `EntityField with uuid ${efUuid} not found`,
      );
    const chartDetail = await this.chartDetailService.findOne(chdUuid);
    if (!chartDetail)
      throw new BadRequestException(
        `chart detail with uuid ${efUuid} not found`,
      );
    if (entityField.etId !== chartDetail.etId)
      throw new BadRequestException(
        'The provided entity fields do not belong to the entity type that the chart detail is associated with',
      );
    return await this.create({
      ...rest,
      entityField,
      chartDetail,
    });
  }
  async addMany(
    createMultipleChartDetailFieldDto: CreateMultipleChartDetailFieldDto,
  ) {
    return await Promise.all(
      createMultipleChartDetailFieldDto.data.map(
        async (dto: CreateChartDetailFieldDto) => {
          return await this.add(dto);
        },
      ),
    );
  }
  async read(): Promise<DetailField[]> {
    const detailField = await this.chartDetailFieldRepository.find();
    return detailField;
  }
  async modify(
    updateChartDetailFieldDto: UpdateChartDetailFieldDto,
  ): Promise<DetailField> {
    const { uuid, ...rest } = updateChartDetailFieldDto;
    return await this.update(uuid, rest);
  }
  async modifyMany(
    updateMultipleChartDetailFieldDto: UpdateMultipleChartDetailFieldDto,
  ) {
    return await Promise.all(
      updateMultipleChartDetailFieldDto.data.map(
        async (dto: UpdateChartDetailFieldDto) => {
          return await this.modify(dto);
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
