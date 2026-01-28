import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateEntityTypeDto,
  CreateMultipleEntityTypeDto,
  MultipleUuidDto,
  UpdateEntityTypeDto,
  UpdateMultipleEntityTypeDto,
  UuidDto,
} from 'libs/dtos';
import { Repository } from 'typeorm';
import { EntityType } from 'libs/database';
import { AbstractionLevelEnum } from 'libs/enums';
import { EntityTypeService, PlantService } from '../../../insight';
import { BaseService } from '../../common/providers/base.service';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class EntityTypeBaseService extends BaseService<EntityType> {
  constructor(
    @InjectRepository(EntityType)
    private readonly entityTypeRepository: Repository<EntityType>,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
    @Inject(forwardRef(() => EntityTypeService))
    private readonly entityTypeService: EntityTypeService,
  ) {
    super(entityTypeRepository, 'Entity Type');
  }

  async findPlantEntityTypes(plantUuid: string) {
    const entityTypes =
      await this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid);
    return entityTypes;
  }
  async add(createEntityTypeDto: CreateEntityTypeDto): Promise<EntityType> {
    const { name, tag, abstractionLevel, description, plantUuid } =
      createEntityTypeDto;

    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const check = await this.ensureTagIsUniqueForPlant(tag, plantUuid);
    if (!check)
      throw new ConflictException(
        `Tag ; ${tag} already taken for plant : ${plant.entityTag}`,
      );
    return await this.create({
      name,
      tag,
      abstractionLevel,
      description,
      plantId: plant.eId,
    });
  }
  async findOneById(etId: number): Promise<EntityType> {
    const entityType = await this.entityTypeRepository.findOne({
      where: {
        etId,
      },
    });
    if (!entityType)
      throw new BadRequestException(`Entity Type with etId: ${etId} not found`);
    return entityType;
  }
  async addMany(
    createEntityTypeArrayDto: CreateMultipleEntityTypeDto,
  ): Promise<EntityType[]> {
    return await Promise.all(
      createEntityTypeArrayDto.data.map(
        async (createEntityTypeDto: CreateEntityTypeDto) => {
          return await this.add(createEntityTypeDto);
        },
      ),
    );
  }
  async modify(updateEntityTypeDto: UpdateEntityTypeDto): Promise<EntityType> {
    const { uuid, ...updateData } = updateEntityTypeDto;
    return await this.update(uuid, updateData);
  }
  async modifyMany(
    updateEntityTypeArrayDto: UpdateMultipleEntityTypeDto,
  ): Promise<EntityType[]> {
    return await Promise.all(
      updateEntityTypeArrayDto.data.map(async (dto: UpdateEntityTypeDto) => {
        return await this.modify(dto);
      }),
    );
  }
  async remove(uuidDto: UuidDto): Promise<boolean> {
    const { uuid } = uuidDto;
    const entityType = await this.findOne(uuid);
    if (!entityType)
      throw new NotFoundException(ERROR_MESSAGES.ENTITY_TYPE_NOT_FOUND(uuid));

    if (entityType.abstractionLevel === AbstractionLevelEnum.DEVICE)
      throw new NotFoundException(ERROR_MESSAGES.ENTITY_TYPE_NOT_FOUND(uuid));

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
  async ensureTagIsUniqueForPlant(
    tag: string,
    plantUuid: string,
  ): Promise<boolean> {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const entityType = await this.entityTypeRepository.findOne({
      where: {
        plantId: plant.eId,
        tag,
      },
    });
    if (entityType) return false;
    return true;
  }
}
