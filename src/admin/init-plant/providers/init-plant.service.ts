import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ERROR_MESSAGES } from 'libs/constants';
import {
  BrowserGroupEntity,
  buildPlantSourcesQuery,
  ElasticService,
  EntityField,
  EntityFieldSchema,
  EntityModel,
  EntityType,
  EntityTypeFieldSetupStatus,
  fetchPlantDevicesQuery,
  FleetManager,
  getPlantElasticIndexesQuery,
  getPlantParametersQuery,
} from 'libs/database';
import {
  CreateEntityFieldDto,
  CreateUpdateMultipleSourceDto,
  CreateUpdateSourceDto,
  InitMultiplePlantEntityDto,
  InitMultiplePlantEntityTypesDto,
  InitMultpleComputationalParametersDto,
  InitMultpleStaticParametersDto,
  InitPlantEntity,
  InitPlantEntityTypes,
  InitPlantTagDto,
  InitStaticParametersDto,
  PlantUuidDto,
  InitComputationalParametersDto,
  InitPlantNonComputationalParametersDto,
} from 'libs/dtos';
import {
  AbstractionLevelEnum,
  BrowserGroupEnum,
  PlantSetupEnum,
} from 'libs/enums';
import {
  IEntityTypeWithParameters,
  IFirstStepCredentials,
  IGetParametersOfEntityTypesResponse,
  IPlantInitElasticIndexStatus,
  ISourceWithDevices,
  ISourceWithDevicesApiResult,
} from 'libs/interfaces';
import {
  BrowserGroupService,
  EntityBaseService,
  PlantEventService,
  PlantStateService,
  SourceService,
  PlantStatusService,
  PlantService,
  EntityTypeService,
  EntityService,
  EntityFieldService,
  FleetManagerService,
  ProvinceService,
  CompanyService,
  PlantTypeService,
} from 'libs/modules';
import { validateUniqueCombination } from 'libs/utils';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  Like,
  QueryRunner,
} from 'typeorm';
@Injectable()
export class InitPlantService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly entityBaseService: EntityBaseService,
    private readonly elasticSearchService: ElasticService,
    private readonly sourceService: SourceService,
    private readonly browserGroupService: BrowserGroupService,
    private readonly stateService: PlantStateService,
    private readonly eventService: PlantEventService,
    private readonly statusService: PlantStatusService,
    private readonly plantService: PlantService,
    private readonly entityTypeService: EntityTypeService,
    private readonly entityService: EntityService,
    private readonly entityFieldService: EntityFieldService,
    private readonly fleetManagerService: FleetManagerService,
    private readonly companyService: CompanyService,
    private readonly provinceService: ProvinceService,
    private readonly plantTypeService: PlantTypeService,
  ) {}
  async fetchAllPlantWithSetupStep() {
    const plants = await this.plantService.getPlants();
    return plants;
  }
  async fetchOnePlantWithSetupStep(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plants = await this.plantService.fetchWithFleet(plantUuid);
    return plants;
  }
  async getElasticIndexes(): Promise<IFirstStepCredentials> {
    const elasticQuery = getPlantElasticIndexesQuery();
    const result = await this.elasticSearchService.search('*', elasticQuery);
    const elasticIndexes = result.aggregations.unique_plants.buckets
      .filter(
        (item) =>
          !item.key.includes('availability') && !item.key.includes('weather'),
      )
      .map((item) => item.key.split('-')[0]);
    const plants = await this.plantService.fetchPlants();
    const elasticIndexResults: IPlantInitElasticIndexStatus[] =
      elasticIndexes.map((index) => {
        const isSetuped = plants.some((plant) => plant.entityTag === index);
        return { elasticIndex: index, isSetuped };
      });
    const companies = await this.companyService.findAll();
    const plantTypes = await this.plantTypeService.findAll();
    const provinces = await this.provinceService.findAll();
    return {
      companies,
      plantTypes,
      provinces,
      elasticIndexResults,
    } as unknown as IFirstStepCredentials;
  }
  async initPlantTag(initPlantTagDto: InitPlantTagDto): Promise<EntityModel> {
    const {
      elasticIndex,
      entityName,
      plantTypeUuid,
      provinceUuid,
      companyUuid,
    } = initPlantTagDto;
    const company = await this.companyService.findOne(companyUuid);
    const province = await this.provinceService.findOne(provinceUuid);
    const plantType = await this.plantTypeService.findOne(plantTypeUuid);
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    if (!province) {
      throw new BadRequestException('Province not found');
    }

    if (!plantType) {
      throw new BadRequestException('Plant type not found');
    }
    const tag = elasticIndex.replace(/[^a-zA-Z0-9]/g, '');
    const existingEntity = await this.entityBaseService.findOneByTag(tag);
    if (existingEntity)
      throw new ConflictException(`plant Tag: ${tag} is already Taken`);
    const validateElasticIndex = await this.elasticSearchService.doesIndexExist(
      `${elasticIndex}-*`,
    );
    if (!validateElasticIndex)
      throw new BadRequestException(
        `elastic Index: ${elasticIndex} is not valid.`,
      );
    const result: FleetManager = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const plantEntity = await this.plantService.createPlantTransaction(
          tag,
          entityName,
          manager,
        );
        return await this.fleetManagerService.createFleetManagerTransaction(
          plantEntity,
          company,
          province,
          plantType,
          manager,
        );
      },
    );

    return this.plantService.fetchWithFleetByPlantId(result.plant.eId);
  }

  async getSources(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    // const plant = await this.plantService.fetchWithFleet(plantUuid);
    // this.fleetManagerService.initPlantGetServicesException(plant);
    const plantIndex =
      await this.plantService.getPlantElasticSearchIndex(plantUuid);
    const elasticQuery = buildPlantSourcesQuery();
    const result = await this.elasticSearchService.search(
      plantIndex,
      elasticQuery,
    );
    return result.aggregations.server_names.buckets.map(
      (item: any) => item.key,
    );
  }

  async insertOrUpdateSources(
    createUpdateMultipleSourceDto: CreateUpdateMultipleSourceDto,
  ) {
    const { plantUuid, ...rest } = createUpdateMultipleSourceDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InitiateTag,
    );
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      await Promise.all(
        rest.data.map((item: CreateUpdateSourceDto) =>
          this.sourceService.addOrUpdateTransaction(plant, item, manager),
        ),
      );
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InitateSources,
        manager,
      );
      return true;
    });
  }

  async getDevicesWithSources(
    plantUuidDto: PlantUuidDto,
  ): Promise<ISourceWithDevices[]> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantGetServicesException(plant);
    const plantElasticIndex =
      await this.plantService.getPlantElasticSearchLastDayIndex(plantUuid);
    const elasticQuery = fetchPlantDevicesQuery();
    const result = await this.elasticSearchService.search(
      plantElasticIndex,
      elasticQuery,
    );
    const sources = await this.sourceService.read(plantUuid);
    if (sources.length === 0)
      throw new BadRequestException('Sources have not been initialized');
    return result.aggregations.by_sub.buckets.map((item: any) => {
      const key = item.key;
      const source = sources.find((obj) => obj.key === key);
      if (!source)
        throw new BadRequestException(
          'Please ensure all required sources are properly initialized before continuing',
        );
      const devices = item.unique_device_names.buckets.map((device) => {
        return device.key;
      });
      return {
        sourceName: source.sourceName,
        devices,
      };
    }) as unknown as ISourceWithDevices[];
  }

  async confirmDeviceWithSources(plantUuidDto: PlantUuidDto): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InitateSources,
    );
    await this.dataSource.transaction(async (manager: EntityManager) => {
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.ConfirmSourceWithDevices,
        manager,
      );
    });
    return true;
  }

  async getDevicesWithSourcesWithEnitityTypes(
    plantUuidDto: PlantUuidDto,
  ): Promise<ISourceWithDevicesApiResult> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantGetServicesException(plant);
    const sourceAndTheirDevices =
      await this.getDevicesWithSources(plantUuidDto);
    const entityTypes =
      await this.entityTypeService.findAllPlantEntityTypesWithPlantTag();

    return { entityTypes, sourceAndTheirDevices };
  }

  async getParametersOfEntityTypes(
    plantUuidDto: PlantUuidDto,
  ): Promise<IGetParametersOfEntityTypesResponse> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantGetServicesException(plant);
    const entityTypes =
      await this.plantService.fetchPlantEntityTypesWithFieldSetupStatus(
        plantUuid,
      );
    const plantIndex =
      await this.plantService.getPlantElasticSearchLastDayIndex(plantUuid);
    const entityTypeWithParameters: IEntityTypeWithParameters[] = [];
    for (const entityType of entityTypes) {
      const elasticQuery = getPlantParametersQuery(entityType.tag);
      const result = await this.elasticSearchService.search(
        plantIndex,
        elasticQuery,
      );
      const parametersJsonObject = result.hits.hits[0]?._source;
      if (parametersJsonObject) {
        const paramters: string[] = Object.keys(parametersJsonObject);
        entityTypeWithParameters.push({
          entityType,
          paramters,
        });
      }
    }
    return { entityTypes, entityTypeWithParameters };
  }

  async initPlantEntityTypes(
    initMultiplePlantEntityTypesDto: InitMultiplePlantEntityTypesDto,
  ): Promise<EntityType[]> {
    const { plantUuid, ...rest } = initMultiplePlantEntityTypesDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.ConfirmSourceWithDevices,
    );

    const plantEntityTypes =
      await this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid);
    rest.data.forEach((obj: InitPlantEntityTypes) => {
      const entityType = plantEntityTypes.find((item) => item.tag === obj.tag);
      if (entityType)
        throw new ConflictException(
          `Entity Type '${obj.tag}' already exists for plant: '${plant.entityTag}'.`,
        );
    });
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityTypes: EntityType[] = [];
      const entityTypeRepo = manager.getRepository(EntityType);
      const entityFieldsSchemas = rest.data.map((item) => {
        const { tag } = item;
        return entityTypeRepo.create({
          tag,
          name: tag,
          abstractionLevel: AbstractionLevelEnum.DEVICE,
          plant,
        });
      });
      await entityTypeRepo.insert(entityFieldsSchemas);
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntityTypes,
        manager,
      );
      return entityTypes;
    });
  }

  async getEntityTypeDeviceReport(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantGetServicesException(plant);
    return await this.plantService.getPlantEntityTypeInitiatedDeviceInElasticAndPostgresStatus(
      plantUuid,
    );
  }

  async initPlantEntites(
    initMultiplePlantEntityDto: InitMultiplePlantEntityDto,
  ): Promise<boolean> {
    const { plantUuid, ...rest } = initMultiplePlantEntityDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityTypes,
    );
    const plantEntites = await this.entityService.fetchPlantEntities(
      plant.uuid,
    );
    const weatherEntity =
      await this.entityService.fetchPlantWeatherEntity(plantUuid);
    const entityTypes =
      await this.entityTypeService.fetchPlantDeviceEntityTypes(plant.uuid);
    rest.data.forEach((item: InitPlantEntity) => {
      const searchInEntityTypes = entityTypes.find(
        (obj) => obj.uuid === item.etUuid,
      );
      if (!searchInEntityTypes)
        throw new BadRequestException(
          `entity: ${item.entityTag} with etUuid: ${item.etUuid} is not allowed to be inserted for plant: ${plant.entityTag}.`,
        );
      const searchInEntities = plantEntites.find(
        (element) => element.entityTag === item.entityTag,
      );
      if (searchInEntities)
        throw new ConflictException(
          `entityTag: "${item.entityTag}" already exist.`,
        );
    });

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityRepo = manager.getRepository(EntityModel);

      const entitiesSchema = rest.data.map((item) => {
        const { entityTag, etUuid } = item;
        const entityType = entityTypes.find((obj) => obj.uuid === etUuid);
        return entityRepo.create({
          entityTag,
          entityName: entityTag.split(':')[2],
          entityType,
        });
      });

      await entityRepo.insert(entitiesSchema);

      if (!weatherEntity) {
        await this.entityTypeService.initiateWeatherPredictionEntityAndEntityType(
          plant.uuid,
          manager,
        );
      }
      return true;
    });
  }

  async confirmInitPlantEntities(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityTypes,
    );
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      await this.entityTypeService.initiateWeatherPredictionEntityAndEntityType(
        plant.uuid,
        manager,
      );
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntities,
        manager,
      );
      return true;
    });
  }

  async initPlantNonComputationalParameters(
    initPlantNonComputationalParametersDto: InitPlantNonComputationalParametersDto,
  ): Promise<boolean> {
    const { plantUuid, etUuid, ...rest } =
      initPlantNonComputationalParametersDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntities,
    );

    const plantEntityFields =
      await this.entityFieldService.fetchPlantParameters(plant.uuid);
    const entityTypes =
      await this.entityTypeService.fetchPlantDeviceEntityTypes(plant.uuid);
    const entityType = entityTypes.find((element) => element.uuid === etUuid);
    if (!entityType)
      throw new BadRequestException(
        `etUuid: ${etUuid} is not allowed to be inserted for plant: ${plant.entityTag}.`,
      );
    rest.data.forEach((item: CreateEntityFieldDto) => {
      const searchInEntityFields = plantEntityFields.find(
        (element) =>
          element.fieldTag === item.fieldTag &&
          element.etId === entityType.etId,
      );
      if (searchInEntityFields)
        throw new ConflictException(
          `entity Field: "${item.fieldTag}" already exist for entityType : ${entityType.tag} in plant:${plant.entityTag}.`,
        );
    });

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityFieldRepo = manager.getRepository(EntityField);
      const browserGroupRepo = manager.getRepository(BrowserGroupEntity);
      const entityTypeFieldSetupStatus = manager.getRepository(
        EntityTypeFieldSetupStatus,
      );

      const entityFieldsSchema = rest.data.map((item) => {
        const { fieldTag } = item;
        const entityType = entityTypes.find((obj) => obj.uuid === etUuid);

        return entityFieldRepo.create({
          fieldTag,
          fieldTitle: fieldTag.replace(/[_-]+/g, ' '),
          browserGroupOld: 'Parameters',
          entityType,
        });
      });

      const entityFields = await entityFieldRepo.insert(entityFieldsSchema);
      const entityFieldsObj = await entityFieldRepo.findByIds(
        entityFields.identifiers.map((id) => id.efId),
      );

      const browserGroupSchema = entityFieldsObj.map((entityField) => {
        return {
          name: BrowserGroupEnum.PARAMETERS,
          entityField,
        };
      });
      await browserGroupRepo.insert(browserGroupSchema);

      const entityTypeFieldSetupStatusSchema =
        entityTypeFieldSetupStatus.create({
          entityType,
          isFieldsInitiated: true,
        });
      await entityTypeFieldSetupStatus.save(entityTypeFieldSetupStatusSchema);
      return true;
    });
  }

  async confirmInitPlantEntityFields(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntities,
    );
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntityFields,
        manager,
      );
      return true;
    });
  }

  async fetchStaticParametersSchema(): Promise<EntityFieldSchema[]> {
    const staticFields =
      await this.entityFieldService.fetchStaticParametersSchema();
    return staticFields;
  }

  async initStaticParameters(
    initMultpleStaticParametersDto: InitMultpleStaticParametersDto,
  ) {
    const { plantUuid, ...rest } = initMultpleStaticParametersDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityFields,
    );
    const { entityType } = plant;
    const staticFields =
      await this.entityFieldService.fetchStaticParametersSchema();
    const fields = await this.entityFieldService.fetchPlantParameters(
      plant.uuid,
    );
    rest.data.forEach((element: InitStaticParametersDto) => {
      const entityFieldSchemaObj = staticFields.find(
        (obj) => obj.uuid === element.uuid,
      );
      if (!entityFieldSchemaObj)
        throw new BadRequestException(
          ERROR_MESSAGES.ENTITY_FIELD_SCHEMA_NOT_FOUND(element.uuid),
        );

      const entityField = fields.find(
        (obj) => obj.fieldTag === entityFieldSchemaObj.fieldTag,
      );
      if (entityField)
        throw new BadRequestException(
          `the provided entity field ${entityField.fieldTag} alreay exist for plant : ${plant.entityTag}`,
        );
    });
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityFieldRepo = manager.getRepository(EntityField);
      const browserGroupRepo = manager.getRepository(BrowserGroupEntity);

      const staticParametersSchema = rest.data.map((item) => {
        const { staticValue } = item;
        const entityFieldSchemaObj = staticFields.find(
          (obj) => obj.uuid === item.uuid,
        );

        if (!entityFieldSchemaObj) {
          throw new BadRequestException(
            `EntityField schema not found for uuid: ${item.uuid}`,
          );
        }

        const { uuid, fieldTitle, fieldTag, unit, maskFunction } =
          entityFieldSchemaObj;

        // Create EntityField instance with proper typing
        const entityFieldData: DeepPartial<EntityField> = {
          fieldTitle,
          fieldTag,
          isComputational: false,
          isStatic: true,
          unit,
          maskFunction,
          etId: entityType.etId,
          staticValue,
          browserGroupOld: 'GeneralConfig',
        };

        return entityFieldRepo.create(entityFieldData);
      });

      const entityFields = await entityFieldRepo.insert(staticParametersSchema);
      const entityFieldsObj = await entityFieldRepo.findByIds(
        entityFields.identifiers.map((id) => id.efId),
      );

      const browserGroupSchema = entityFieldsObj.map((entityField) => ({
        name: BrowserGroupEnum.GENERALCONFIG,
        entityField,
      }));

      await browserGroupRepo.insert(browserGroupSchema);
      return true;
    });
  }

  async fetchComputationalParameters(): Promise<EntityFieldSchema[]> {
    const computationalFields =
      await this.entityFieldService.fetchComputationalParametersSchema();
    return computationalFields;
  }

  async initComputationalParameters(
    initMultpleComputationalParametersDto: InitMultpleComputationalParametersDto,
  ) {
    const { plantUuid, ...rest } = initMultpleComputationalParametersDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityFields,
    );
    const computationalFields =
      await this.entityFieldService.fetchComputationalParametersSchema();
    const parameters = await this.entityFieldService.fetchPlantParameters(
      plant.uuid,
    );
    rest.data.forEach((element: InitComputationalParametersDto) => {
      const entityFieldSchemaObj = computationalFields.find(
        (obj) => obj.uuid === element.uuid,
      );
      if (!entityFieldSchemaObj)
        throw new BadRequestException(
          ERROR_MESSAGES.ENTITY_FIELD_SCHEMA_NOT_FOUND(element.uuid),
        );
      const entityField = parameters.find(
        (obj) => obj.fieldTag === entityFieldSchemaObj.fieldTag,
      );
      if (entityField)
        throw new BadRequestException(
          `the provided entity field ${element.uuid} alreay exist for plant with uuid : ${plant.uuid}`,
        );
    });
    const mapped = rest.data.map((item) => {
      const computationalField = computationalFields.find(
        (obj) => obj.uuid === item.uuid,
      );
      if (!computationalField)
        throw new BadRequestException(
          'computational field with this uuid not found',
        );
      const { uuid, maxLength, minLength, isEnum, defaultValue, ...other } =
        computationalField;
      return {
        ...item,
        ...other,
      };
    });
    const uniqueFields = ['fieldTag', 'etUuid'];
    const { check, combo } = validateUniqueCombination(mapped, uniqueFields);
    if (!check)
      throw new BadRequestException(
        `Duplicate combination found for fields [${uniqueFields.join(
          ', ',
        )}]: ${combo}`,
      );
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityFieldRepo = manager.getRepository(EntityField);
      for (const item of rest.data) {
        const entityFieldSchemaObj = computationalFields.find(
          (obj) => obj.uuid === item.uuid,
        );
        if (!entityFieldSchemaObj)
          throw new BadRequestException(
            'entity field schema uuid is not valid',
          );
        const { uuid, ...rest } = entityFieldSchemaObj;
        const entityFieldSchema = entityFieldRepo.create({
          ...rest,
          etId: plant.etId!,
          browserGroupOld: 'Parameters',
        });
        const entityFieldObj = await entityFieldRepo.save(entityFieldSchema);

        await this.browserGroupService.createBrowserGroupTransaction(
          BrowserGroupEnum.PARAMETERS,
          entityFieldObj,
          manager,
        );
      }
      await this.initWeatherParameters(plant.uuid, manager);
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.IntStaticAndComputationalFields,
        manager,
      );
      return true;
    });
  }
  async plantSetupReport(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantGetServicesException(plant);
    return await this.plantService.getPlantReport(plant);
  }

  async initTablesAndAppendToAdmin(
    plantUuidDto: PlantUuidDto,
  ): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.fleetManagerService.initPlantSetupStepException(
      plant,
      PlantSetupEnum.IntStaticAndComputationalFields,
    );
    await this.plantService.ensureAlertEnumValuesExistInSchemas([
      'status',
      'status_alerts',
      'states',
      'events',
    ]);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await this.statusService.createPlantStatusTable(plant, queryRunner);
    await this.stateService.createPlantStateTable(plant, queryRunner);
    await this.eventService.createPlantEventTable(plant, queryRunner);
    await this.appendToAdmins(plantUuidDto, queryRunner);
    await this.fleetManagerService.updateFleetManagerQueryRunnerTransaction(
      plant,
      PlantSetupEnum.Completed,
      queryRunner,
    );
    await queryRunner.commitTransaction();
    return true;
  }

  async appendToAdmins(plantUuidDto: PlantUuidDto, queryRunner: QueryRunner) {
    const { plantUuid } = plantUuidDto;
    await this.plantService.fetchWithFleet(plantUuid);
    const manager: EntityManager = queryRunner.manager;
    await this.plantService.grantPlantAccessToAllAdmins(plantUuid, manager);
  }
  private async initWeatherParameters(
    plantUuid: string,
    manager: EntityManager,
  ) {
    const entityFieldRepo = manager.getRepository(EntityField);
    const browserGroupRepo = manager.getRepository(BrowserGroupEntity);
    const plant = await this.plantService.fetchWithFleet(plantUuid);

    const weatherEntityType =
      await this.entityTypeService.fetchPlantWeatherEntityType(plant.uuid);
    if (!weatherEntityType) return;

    const weatherFields =
      await this.entityFieldService.fetchWeatherParametersSchema();
    const plantWeatherParameters =
      await this.entityFieldService.fetchInitiatedWeatherParameters(
        plant.uuid,
        'Plant',
      );
    const unInitiatedPlantWeatherParameters = weatherFields.filter(
      (weatherField) =>
        !plantWeatherParameters.some(
          (parameter) => parameter.fieldTag === weatherField.fieldTag,
        ),
    );

    const entityWeatherParameters =
      await this.entityFieldService.fetchInitiatedWeatherParameters(
        plant.uuid,
        'Entity',
      );

    const unInitiatedEntityWeatherParameters = weatherFields.filter(
      (weatherField) =>
        !entityWeatherParameters.some(
          (parameter) => parameter.fieldTag === weatherField.fieldTag,
        ),
    );
    for (const item of unInitiatedEntityWeatherParameters) {
      const { uuid, ...rest } = item;
      const entityFieldSchema = entityFieldRepo.create({
        ...rest,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        etId: weatherEntityType.etId!,
        browserGroupOld: 'Parameters',
      });
      const entityFieldObj = await entityFieldRepo.save(entityFieldSchema);
      const bgSchema = browserGroupRepo.create({
        name: BrowserGroupEnum.PARAMETERS,
        ...entityFieldObj,
      });
      await browserGroupRepo.save(bgSchema);
    }
    for (const item of unInitiatedPlantWeatherParameters) {
      const { uuid, ...rest } = item;
      const entityFieldSchema = entityFieldRepo.create({
        ...rest,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        etId: plant.etId!,
      });
      const entityFieldObj = await entityFieldRepo.save(entityFieldSchema);
      const bgSchema = browserGroupRepo.create({
        name: BrowserGroupEnum.PARAMETERS,
        ...entityFieldObj,
      });
      await browserGroupRepo.save(bgSchema);
    }
  }
}
