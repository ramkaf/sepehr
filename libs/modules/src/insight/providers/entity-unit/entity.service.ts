import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityField, EntityModel, EntityType } from 'libs/database';
import { In, Like, Repository } from 'typeorm';
import {
  EntityBaseService,
  EntityTypeBaseService,
  UserGlobalService,
} from '../../../entity-management';
import { EntityTypeService } from './entity-type.service';
import { PlantService } from '../plant-unit/plants.service';

@Injectable()
export class EntityService {
  constructor(
    @InjectRepository(EntityType)
    private readonly entityTypeRepository: Repository<EntityType>,
    @InjectRepository(EntityModel)
    private readonly entityRepository: Repository<EntityModel>,
    private readonly userService: UserGlobalService,
    private readonly entityTypeService: EntityTypeService,
    private readonly entityBaseService: EntityBaseService,
    private readonly entityTypeBaseService: EntityTypeBaseService,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
  ) {}

  async fetchBySources(sourceStrings: string[]) {
    return await this.entityRepository.findOne({
      where: {
        entityTag: In(sourceStrings),
      },
    });
  }
  async fetchPlantEntities(plantUuid: string): Promise<EntityModel[]> {
    const entity_types =
      await this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid);
    return await this.entityRepository.find({
      where: {
        entityType: In(entity_types.map((item) => item.etId)),
      },
    });
  }
  async fetchDeviceParametersWithPeriodAndBookmark(
    eUuid: string,
    userUuid: string,
  ) {
    const user = await this.userService.findOne(userUuid);
    if (!user)
      throw new BadRequestException(`user with uuid: ${userUuid} not found`);

    const result = await this.entityRepository
      .createQueryBuilder('e')
      .innerJoin('e.entityType', 'et')
      .innerJoin('et.entityFields', 'ef')
      .leftJoin('ef.fieldsPeriod', 'fp')
      .leftJoin('ef.bookmarkFields', 'bf')
      .leftJoin('bf.user', 'u')
      .where('e.uuid = :eUuid', { eUuid })
      .where('u.uuid = :eUuid', { userUuid })
      .select(['e', 'et', 'ef', 'fp', 'bf'])
      .getMany();

    return result;
  }
  async fetchPlantWeatherEntityType(
    plantUuid: string,
  ): Promise<EntityType | null> {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const weather = await this.entityTypeRepository.findOne({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        plantId: plant.eId!,
        tag: 'Weather_prediction',
      },
    });
    return weather;
  }
  async fetchPlantWeatherEntity(
    plantUuid: string,
  ): Promise<EntityModel | null> {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const weatherEntityTypeTag = `${plant.entityTag}:Weather_Prediction`;
    return this.entityRepository.findOne({
      where: {
        entityTag: weatherEntityTypeTag,
      },
    });
  }
  async fetchEntityTypeOfEntity(entityUuid: string) {
    const entity = await this.entityRepository.findOne({
      where: {
        uuid: entityUuid,
      },
      relations: ['entityType'],
    });
    return entity?.entityType ?? null;
  }
  async fetchPlantDevices(plantUuid: string): Promise<EntityModel[]> {
    const entity_types =
      await this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid);
    return await this.entityRepository.find({
      where: {
        entityType: In(entity_types.map((item) => item.etId)),
      },
    });
  }
  async fetchEntityPlant(eUuid: string): Promise<EntityModel> {
    const entity = await this.entityRepository.findOne({
      where: {
        uuid: eUuid,
      },
    });
    if (!entity || !entity.etId)
      throw new BadRequestException(`entity with uuid: ${eUuid} is not found`);
    const entityType = await this.entityTypeBaseService.findOneById(
      entity.etId,
    );
    if (!entityType || !entityType.plantId)
      throw new BadRequestException(`entity with uuid: ${eUuid} is not found`);
    const plant = await this.entityBaseService.findOneById(entityType.plantId);
    return plant;
  }
  async fetchEntityFieldsWithBookmarksAndPeriod(
    eUuid: string,
    userUuid: string,
    parameters: EntityField[] = [], // : Promise<IEntityData>
  ) {
    const efIds = parameters.map((item) => item.efId);

    let query = this.entityRepository
      .createQueryBuilder('e')
      .innerJoinAndSelect('e.entityType', 'et')
      .innerJoinAndSelect('et.entityFields', 'ef')
      .leftJoinAndSelect('ef.bookmarkFields', 'bf')
      .leftJoinAndSelect('bf.user', 'user', 'user.uuid = :userUuid', {
        userUuid,
      })
      .leftJoinAndSelect('ef.fieldsPeriod', 'pf')
      .where('e.uuid = :uuid', { uuid: eUuid });

    if (efIds.length > 0) {
      query = query.andWhere('ef.efId IN (:...efIds)', { efIds });
    }
    const entity = await query
      .orderBy('CASE WHEN bf.id IS NOT NULL THEN 0 ELSE 1 END', 'ASC') // Bookmarked fields first
      .addOrderBy('bf.createdAt', 'DESC') // Newest bookmarks first
      .addOrderBy('ef.fieldTag', 'ASC') // Then sort by fieldTag
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        `The requested entity with UUID '${eUuid}' was not found in the system. Please verify the UUID and try again.`,
      );
    }
    return entity;
  }
  async fetchPlantEntitiesWithSpecificEntityTypeTag(
    plantId: number,
    tags: string[],
  ): Promise<EntityModel[]> {
    return await this.entityRepository.find({
      where: {
        entityType: {
          plantId,
          tag: In(tags),
        },
      },
      relations: {
        entityType: true,
      },
    });
  }
}
