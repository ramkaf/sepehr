import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EntityTypeBaseService } from '../../entity-types/providers/entity-type.base.service';
import {
  CreateEntityFieldDto,
  CreateMultipleEntityFieldDto,
  MultipleUuidDto,
  UpdateEntityFieldDto,
  UpdateMultipleEntityFieldDto,
  UuidDto,
} from 'libs/dtos';
import {
  BrowserGroupEntity,
  EntityField,
  PlantFieldVisibility,
} from 'libs/database';
import { BrowserGroupEnum } from 'libs/enums';
import { EntityFieldService } from '../../../insight';
import { ISearchEntityFieldDto } from 'libs/interfaces';
import { BaseService } from '../../common/providers/base.service';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class EntityFieldBaseService extends BaseService<EntityField> {
  constructor(
    @InjectRepository(EntityField)
    private readonly entityFieldRepository: Repository<EntityField>,
    @InjectRepository(PlantFieldVisibility)
    private readonly plantFieldVisibilityRepository: Repository<PlantFieldVisibility>,
    @InjectRepository(BrowserGroupEntity)
    private readonly browserGroupRepository: Repository<BrowserGroupEntity>,
    private readonly entityTypeBaseService: EntityTypeBaseService,
    @Inject(forwardRef(() => EntityFieldService))
    private readonly entityFieldService: EntityFieldService,
  ) {
    super(entityFieldRepository, 'Entity Field');
  }
  async findPlantParameters(plantUuid: string) {
    return await this.entityFieldService.fetchPlantParameters(plantUuid);
  }

  async findEntityTypeParameters(etUuid: string) {
    return await this.searchInEntityFields({ etUuid });
  }

  async add(createEntityFieldDto: CreateEntityFieldDto): Promise<boolean> {
    const { browserGroup, ...rest } = createEntityFieldDto;
    const { fieldTag, etUuid } = createEntityFieldDto;
    const entityType = await this.entityTypeBaseService.findOne(etUuid);

    if (!entityType)
      throw new NotFoundException(`Entity type not found for UUID: ${etUuid}`);

    const ensureEntityFieldTagNotExist =
      await this.entityFieldRepository.findOne({
        where: {
          fieldTag,
          entityType,
        },
      });

    if (ensureEntityFieldTagNotExist)
      throw new ConflictException(
        `fieldTag: ${fieldTag} are exist for entity type: ${entityType.tag}`,
      );
    const entityField = await this.create({
      ...rest,
      entityType,
      browserGroupOld: browserGroup.join('+'),
    });
    const browserGroups: BrowserGroupEntity[] = [];
    for (const group of browserGroup) {
      const bg = new BrowserGroupEntity();
      bg.name = group;
      bg.entityField = entityField;
      browserGroups.push(bg);
    }
    await this.browserGroupRepository.save(browserGroups);
    return true;
  }

  async addMany(
    createEntityFieldArrayDto: CreateMultipleEntityFieldDto,
  ): Promise<boolean> {
    await Promise.all(
      createEntityFieldArrayDto.data.map(
        async (createEntityFieldDto: CreateEntityFieldDto) => {
          return await this.add(createEntityFieldDto);
        },
      ),
    );
    return true;
  }

  async modify(updateEntityFieldDto: UpdateEntityFieldDto): Promise<boolean> {
    const { uuid, browserGroup, isEnabled, ...rest } = updateEntityFieldDto;
    await this.update(uuid, rest);
    const entityField = await this.entityFieldRepository.findOne({
      where: { uuid },
      relations: ['browserGroup'],
    });
    if (!entityField)
      throw new BadRequestException(
        ERROR_MESSAGES.ENTITY_FIELD_NOT_FOUND(uuid),
      );
    const entityType = await this.entityTypeBaseService.findOneById(
      entityField.etId,
    );

    if (browserGroup !== undefined) {
      const existingBrowserGroups = new Map<
        BrowserGroupEnum,
        BrowserGroupEntity
      >();
      if (entityField.browserGroup && entityField.browserGroup.length > 0) {
        for (const bg of entityField.browserGroup) {
          existingBrowserGroups.set(bg.name, bg);
        }
      }
      const browserGroupsToAdd: BrowserGroupEntity[] = [];
      for (const groupName of browserGroup) {
        if (!existingBrowserGroups.has(groupName)) {
          const newBrowserGroup = new BrowserGroupEntity();
          newBrowserGroup.name = groupName;
          newBrowserGroup.entityField = entityField;
          browserGroupsToAdd.push(newBrowserGroup);
        }
        existingBrowserGroups.delete(groupName);
      }
      if (browserGroupsToAdd.length > 0) {
        await this.browserGroupRepository.save(browserGroupsToAdd);
        //old browserGroup
        await this.entityFieldRepository.update(entityField.efId, {
          browserGroupOld: browserGroup.join('+'),
        });
      }

      if (existingBrowserGroups.size > 0) {
        const browserGroupsToRemove = Array.from(
          existingBrowserGroups.values(),
        );
        await this.browserGroupRepository.remove(browserGroupsToRemove);

        //old browser group
        const concatedBrowserGroup = browserGroup.join('+');
        await this.entityFieldRepository.update(entityField.efId, {
          browserGroupOld: concatedBrowserGroup,
        });
        // old browser group
      }
    }
    if (isEnabled !== undefined) {
      await this.plantFieldVisibilityRepository.upsert(
        {
          efId: entityField.efId,
          plantId: entityType.plantId,
          isEnabled,
        },
        ['efId', 'plantId'],
      );
    }
    return true;
  }

  async modifyMany(
    UpdateMultipleEntityFieldDto: UpdateMultipleEntityFieldDto,
  ): Promise<boolean> {
    await Promise.all(
      UpdateMultipleEntityFieldDto.data.map(
        async (updateEntityFieldDto: UpdateEntityFieldDto) => {
          return await this.modify(updateEntityFieldDto);
        },
      ),
    );
    return true;
  }

  async remove(uuidDTO: UuidDto): Promise<boolean> {
    const { uuid } = uuidDTO;
    const entityField = await this.findOne(uuid);
    if (!entityField)
      throw new NotFoundException(ERROR_MESSAGES.ENTITY_FIELD_NOT_FOUND(uuid));
    await this.browserGroupRepository.delete({ entityField });

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

  async fetchFieldByTag(fieldTag: string, plantId: number) {
    return await this.entityFieldRepository.findOne({
      where: {
        fieldTag,
        entityType: {
          plantId: plantId,
        },
      },
    });
  }

  private async searchInEntityFields(
    filters: ISearchEntityFieldDto,
  ): Promise<EntityField[]> {
    const query = this.entityFieldRepository
      .createQueryBuilder('entityField')
      .leftJoinAndSelect('entityField.entityType', 'entityTypes')
      .leftJoinAndSelect('entityField.browserGroup', 'browserGroup')
      .select([
        'entityField.uuid',
        'entityField.efId',
        'entityField.fieldTitle',
        'entityField.fieldTag',
        'entityField.unit',
        'entityField.isComputational',
        'entityField.lastValueFunctionName',
        'entityField.allValuesFunctionName',
        'entityField.isStatic',
        'entityField.staticValue',
        'entityField.maskFunction',
        'entityField.fieldType',
        'entityField.defaultCacheValue',

        'entityField.ac_id',
        'entityTypes.etId',
        'entityTypes.name',
        'entityTypes.tag',
        'entityTypes.description',
        'entityTypes.plantId',
        'entityTypes.uuid',
      ]);
    if (filters.etUuid !== undefined) {
      query.andWhere('entityTypes.uuid = :etUuId', { etUuId: filters.etUuid });
    }

    if (filters.fieldTag !== undefined) {
      query.andWhere('entityField.fieldTag = :fieldTag', {
        fieldTag: filters.fieldTag,
      });
    }

    if (filters.fieldTagLike !== undefined) {
      query.andWhere('entityField.fieldTag LIKE :fieldTagLike', {
        fieldTagLike: `%${filters.fieldTagLike}%`,
      });
    }

    if (filters.isStatic !== undefined) {
      query.andWhere('entityField.isStatic = :isStatic', {
        isStatic: filters.isStatic,
      });
    }

    if (filters.isComputational !== undefined) {
      query.andWhere('entityField.isComputational = :isComputational', {
        isComputational: filters.isComputational,
      });
    }
    if (filters.browserGroups && filters.browserGroups.length > 0) {
      this.applyBrowserGroupFilters(query, filters.browserGroups);
    }
    return await query.getMany();
  }

  private applyBrowserGroupFilters(
    query: SelectQueryBuilder<EntityField>,
    browserGroups: BrowserGroupEnum[],
  ): void {
    browserGroups.forEach((group, index) => {
      const alias = `bg${index}`;
      query
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from(BrowserGroupEntity, alias)
            .where(`${alias}.efId = entityField.efId`)
            .andWhere(`${alias}.name = :browserGroup${index}`);

          return `EXISTS ${subQuery.getQuery()}`;
        })
        .setParameter(`browserGroup${index}`, group);
    });
  }
}
