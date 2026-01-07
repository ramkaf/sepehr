import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityTypeBaseService } from '../../entity-types/providers/entity-type.base.service';
import { EntityModel } from 'libs/database';
import {
  CreateEntityDto,
  CreateMultipleEntityDto,
  EntityTypeUuidDto,
  MultipleUuidDto,
  UpdateEntityDto,
  UpdateMultipleEntityDto,
  UuidDto,
} from 'libs/dtos';
import {
  EntityService,
  EntityTypeService,
  PlantService,
} from '../../../insight';
import { BaseService } from '../../common/providers/base.service';
@Injectable()
export class EntityBaseService extends BaseService<EntityModel> {
  constructor(
    @InjectRepository(EntityModel)
    private readonly entityRepository: Repository<EntityModel>,
    @Inject(forwardRef(() => EntityTypeBaseService))
    private readonly entityTypeBaseService: EntityTypeBaseService,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    @Inject(forwardRef(() => EntityTypeService))
    private readonly entityTypeService: EntityTypeService,
  ) {
    super(entityRepository, 'Entity');
  }
  async add(createEntityDto: CreateEntityDto): Promise<EntityModel> {
    const { entityName, entityTag, parentInTreeId, etUuid } = createEntityDto;
    const entityType = await this.entityTypeBaseService.findOne(etUuid);
    if (!entityType)
      throw new BadRequestException('entity type uuid is not valid');
    const existingEntity = await this.findOneByTag(entityTag);

    if (existingEntity)
      throw new ConflictException(`entity tag : ${entityTag} already taken`);

    const entity = await this.create({
      entityName,
      entityTag,
      parentInTreeId,
      entityType,
    });
    return entity;
  }
  async addMany(
    createEntityArrayDto: CreateMultipleEntityDto,
  ): Promise<EntityModel[]> {
    return await Promise.all(
      createEntityArrayDto.data.map(
        async (createEntityDto: CreateEntityDto) => {
          return await this.add(createEntityDto);
        },
      ),
    );
  }
  async findPlantEntites(plantUuid: string) {
    return await this.entityService.fetchPlantEntities(plantUuid);
  }
  async findEntityTypeEntities(entityTypeUuidDto: EntityTypeUuidDto) {
    const { etUuid } = entityTypeUuidDto;
    return this.entityTypeService.fetchEntityTypeDevices(etUuid);
  }
  async findOneByTag(entityTag: string) {
    return await this.entityRepository.findOne({
      where: {
        entityTag,
      },
    });
  }
  async findOneById(eId: number): Promise<EntityModel> {
    const entityType = await this.entityRepository.findOne({
      where: {
        eId,
      },
    });
    if (!entityType)
      throw new BadRequestException(`Entity Type with etId: ${eId} not found`);
    return entityType;
  }
  async findOneWithType(uuid: string) {
    return await this.entityRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        entityType: true,
      },
    });
  }
  async modify(updateEntityDto: UpdateEntityDto): Promise<EntityModel> {
    const { uuid, ...updateData } = updateEntityDto;
    return await this.update(uuid, updateData);
  }
  async modifyMany(
    updateEntityArrayDto: UpdateMultipleEntityDto,
  ): Promise<EntityModel[]> {
    return await Promise.all(
      updateEntityArrayDto.data.map(async (dto: UpdateEntityDto) => {
        return await this.modify(dto);
      }),
    );
  }
  async remove(uuIdDTO: UuidDto): Promise<boolean> {
    const { uuid } = uuIdDTO;
    const isPlantEntity = await this.plantService.fetchWithFleet(uuid);
    if (isPlantEntity)
      throw new BadRequestException(
        `this is plant Entity And its not safe to delete.`,
      );
    await this.destroy(uuid);
    return true;
  }
  async removeMany(multipleUuidDto: MultipleUuidDto): Promise<boolean> {
    await Promise.all(
      multipleUuidDto.data.map(async (dto: UuidDto) => {
        return await this.remove(dto);
      }),
    );
    return true;
  }
}
