import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { Request } from 'express';
import { BrowserService } from '../../dashboard/browser/providers/browser.service';
import {
  EntityModel,
  EntityType,
  Schematic,
  SchematicCategory,
} from 'libs/database';
import {
  EntityBaseService,
  PlantService,
  PlantStateService,
} from 'libs/modules';
import {
  AppendSchematicEntityTypeDto,
  EntityUuidDto,
  CreateSchematicCategoryDto,
  UpdateSchematicCategoryDto,
  FetchSchematicEntities,
  GetSchematicsDto,
  PlantUuidDto,
  UpsertSchematicDto,
  UuidDto,
} from 'libs/dtos';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class SchematicService {
  constructor(
    @InjectRepository(SchematicCategory)
    private readonly schematicCategoryRepository: Repository<SchematicCategory>,
    @InjectRepository(EntityType)
    private readonly entityTypeRepository: Repository<EntityType>,
    @InjectRepository(Schematic)
    private readonly schematicRepository: Repository<Schematic>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly plantService: PlantService,
    private readonly browserService: BrowserService,
    private readonly stateService: PlantStateService,
    private readonly entityBaseService: EntityBaseService,
  ) {}
  async addSchematicCategory(
    createSchematicCategoryDto: CreateSchematicCategoryDto,
  ) {
    const schematicCategorySchema = this.schematicCategoryRepository.create(
      createSchematicCategoryDto,
    );
    return await this.schematicCategoryRepository.save(schematicCategorySchema);
  }

  async appendSchematicToEntityType(
    appendSchematicEntityTypeDto: AppendSchematicEntityTypeDto,
  ) {
    const { schUuid, etUuid } = appendSchematicEntityTypeDto;
    const schematic = await this.schematicCategoryRepository.findOne({
      where: { uuid: schUuid },
    });
    if (!schematic)
      throw new BadRequestException(ERROR_MESSAGES.SCHEMATIC_NOT_FOUND);
    const entityType = await this.entityTypeRepository.findOne({
      where: { uuid: etUuid },
    });
    if (!entityType)
      throw new BadRequestException(ERROR_MESSAGES.ENTITY_TYPE_NOT_FOUND);
    await this.entityTypeRepository.update(
      {
        uuid: etUuid,
      },
      {
        schematic,
      },
    );
    return true;
  }

  async fetchCategories(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const entityTypesWithSchematic = await this.entityTypeRepository.find({
      where: {
        plantId: plant.eId,
        schematic: Not(IsNull()),
      },
      select: ['schematicId'],
    });
    const schematicIds = [
      ...new Set(entityTypesWithSchematic.map((e) => e.schematicId)),
    ];
    return await this.schematicCategoryRepository.find({
      where: {
        id: In(schematicIds),
      },
    });
  }

  async fetchEntityTypeWithSchematicCategoriesOfAPlant(
    plantUuidDto: PlantUuidDto,
  ) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.entityTypeRepository.find({
      where: {
        plantId: plant.etId!,
        schematic: Not(IsNull()),
      },
      relations: {
        schematic: true,
      },
    });
  }

  async updateCategory(updateSchematicCategory: UpdateSchematicCategoryDto) {
    const { uuid, title } = updateSchematicCategory;
    const schematicCategory = await this.schematicCategoryRepository.findOne({
      where: {
        uuid,
      },
    });

    if (!schematicCategory)
      throw new BadRequestException(
        'schematic category with this uuid not found',
      );
    Object.assign(schematicCategory, { title });
    return await this.schematicCategoryRepository.save(schematicCategory);
  }

  async deleteCategory(uuidDto: UuidDto) {
    const { uuid } = uuidDto;
    return await this.schematicCategoryRepository.delete({ uuid });
  }

  async getSchematicEntities(
    fetchSchematicEntities: FetchSchematicEntities,
  ): Promise<EntityModel[]> {
    const { withSubs, etUuid } = fetchSchematicEntities;
    const entityType = await this.entityTypeRepository.findOne({
      where: {
        uuid: etUuid,
      },
    });
    if (!entityType)
      throw new BadRequestException(ERROR_MESSAGES.ENTITY_TYPE_NOT_FOUND);
    let sql: string;
    if (withSubs) {
      sql =
        'SELECT * FROM main.entity WHERE entity_type_id IN (SELECT et_id FROM main.entity_types WHERE plant_id = $1)';
    } else {
      sql = `
          SELECT * FROM main.entity WHERE entity_type_id = $1
          UNION
          SELECT * FROM main.entity WHERE entity_type_id = (
            SELECT entity_type_id FROM main.entity   e_id = (
              SELECT parent_in_tree_id FROM main.entity WHERE entity_type_id = $1 LIMIT 1
            )
          )`;
    }
    const result = await this.dataSource.query(sql, [entityType.etId]);
    return result.map((obj: any) => {
      return {
        uuid: obj.uuid,
        eId: obj.e_id,
        entityName: obj.entity_name,
        entityTag: obj.entity_tag,
        parentInTreeId: obj.parent_in_tree_id,
        etId: obj.entity_type_id,
      };
    });
  }

  async upsertSchematic(
    upsertSchematicDto: UpsertSchematicDto,
  ): Promise<Schematic | null> {
    const { uuid, title, plantUuid, metadata } = upsertSchematicDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    if (uuid) {
      const schematic = await this.schematicRepository.findOne({
        where: {
          uuid,
        },
      });
      if (schematic) {
        Object.assign(schematic, { title, metadata });
        await this.schematicRepository.save(schematic);
      }
      return null;
    } else {
      const schematicSchema = this.schematicRepository.create({
        title,
        metadata,
        plant,
      });
      return await this.schematicRepository.save(schematicSchema);
    }
  }

  async getSchematics(
    getSchematicsDto: GetSchematicsDto,
  ): Promise<Schematic | Schematic[]> {
    const { plantUuid, uuid } = getSchematicsDto;
    if (plantUuid) {
      const plant = await this.plantService.fetchWithFleet(plantUuid);
      return this.schematicRepository.find({
        where: { plantId: plant.eId },
      });
    }
    if (uuid) {
      const schematic = await this.schematicRepository.findOne({
        where: { uuid },
      });

      if (!schematic) {
        throw new BadRequestException(`Schematic with uuid ${uuid} not found`);
      }

      return schematic;
    }

    throw new BadRequestException('Either plantUuid or uuid must be provided');
  }

  async deleteSchematics(uuidDto: UuidDto) {
    const { uuid } = uuidDto;
    return await this.schematicRepository.delete({ uuid });
  }

  async getDeviceParametersWithStates(
    req: Request,
    entityUuidDto: EntityUuidDto,
  ) {
    const { eUuid } = entityUuidDto;
    const entity = await this.entityBaseService.findOne(eUuid);
    if (!entity) throw new BadRequestException(ERROR_MESSAGES.ENTITY_NOT_FOUND);
    const { entityTag } = entity;
    const parameters = await this.browserService.fetchEntityFields(req, {
      eUuid,
    });
    const states = await this.stateService.fetchDeviceStates(entityTag);
    return { parameters, states };
  }
}
