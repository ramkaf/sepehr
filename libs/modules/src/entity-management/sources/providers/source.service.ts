import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PlantService } from '../../../insight';
import { Cacheable, EntityModel, Source } from 'libs/database';
import {
  CreateUpdateMultipleSourceDto,
  CreateUpdateSourceDto,
  UuidDto,
} from 'libs/dtos';
import { BaseService } from '../../common/providers/base.service';

@Injectable()
export class SourceService extends BaseService<Source> {
  constructor(
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
  ) {
    super(sourceRepository, 'Source');
  }

  async addOrUpdate(
    plant: EntityModel,
    createSourceDto: CreateUpdateSourceDto,
  ) {
    const { key, sourceName } = createSourceDto;
    return await this.sourceRepository.upsert(
      {
        key,
        plant,
        sourceName,
      },
      ['plant', 'key'],
    );
  }

  async addOrUpdateTransaction(
    plant: EntityModel,
    createSourceDto: CreateUpdateSourceDto,
    manager: EntityManager,
  ) {
    const { key, sourceName } = createSourceDto;
    const sourceRepository = manager.getRepository(Source);
    return await sourceRepository.upsert(
      {
        key,
        plant,
        sourceName,
      },
      ['plant', 'key'],
    );
  }

  async multipleAddOrUpdate(
    createUpdateMultipleSourceDto: CreateUpdateMultipleSourceDto,
  ) {
    const { plantUuid, data } = createUpdateMultipleSourceDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    await Promise.all(data.map((item) => this.addOrUpdate(plant, item)));
  }

  @Cacheable('24h')
  async read(plantUuid: string): Promise<Source[]> {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.sourceRepository.find({ where: { plantId: plant.eId } });
  }

  @Cacheable('24h')
  async readByPlantId(plantId: number): Promise<Source[]> {
    return await this.sourceRepository.find({ where: { plantId } });
  }

  async remove(uuidDTO: UuidDto) {
    const { uuid } = uuidDTO;
    await this.destroy(uuid);
    return true;
  }

  async mapSub(plantUuid: string, substation: string) {
    const sources = await this.read(plantUuid);
    const source = sources.find((item) => item.sourceName === substation);
    return source ? source.key : '';
  }

  mapkeyToSubWithSources(sources: Source[], key: string) {
    const source = sources.find((item) => item.key === key);
    return source ? source.sourceName : '';
  }

  async mapSubToKeyWithSources(
    plantId: number,
    substation: string,
  ): Promise<string> {
    const sources = await this.readByPlantId(plantId);
    const source = sources.find((item) => item.sourceName === substation);
    if (!source) {
      throw new BadRequestException(
        'Substations are not initialized: source object is missing or undefined.',
      );
    }
    return source.key;
  }
}
