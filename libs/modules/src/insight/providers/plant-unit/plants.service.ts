import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  Like,
  QueryRunner,
  Repository,
} from 'typeorm';
import { SourceService, UserGlobalService } from '../../../entity-management';
import {
  buildDistictElasticDevice,
  buildTypeNonComputationalParameterQuery,
  Cacheable,
  ElasticService,
  EntityField,
  EntityModel,
  EntityType,
  UserEntityAssignment,
} from 'libs/database';
import { ALARM_LEVEL_ENUM_NAME, ERROR_MESSAGES } from 'libs/constants';
import {
  AbstractionLevelEnum,
  AlarmLevelEnum,
  PlantSetupEnum,
} from 'libs/enums';
import { PlantRepositoryService } from '../../repositories/plant.repository';
import { generatePlantIndex, getFormattedDate, logStringify } from 'libs/utils';
import {
  IEntityTypeWithFieldSetupStatus,
  IPlantDeviceParametersFromElasticAndPostgres,
  IPlantSetupReport,
} from 'libs/interfaces';
import { EntityService } from '../entity-unit/entity.service';
import { EntityFieldService } from '../entity-unit/entity-field.service';
import { EntityTypeService } from '../entity-unit/entity-type.service';
import { isNumber, isString } from 'class-validator';

@Injectable()
export class PlantService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly plantRepoService: PlantRepositoryService,
    private readonly entityService: EntityService,
    private readonly entityFieldService: EntityFieldService,
    private readonly entityTypeService: EntityTypeService,
    private readonly elasticService: ElasticService,
    private readonly userService: UserGlobalService,
    @Inject(forwardRef(() => SourceService))
    private readonly sourceService: SourceService,
    @InjectRepository(EntityType)
    private readonly entityTypeRepository: Repository<EntityType>,
    @InjectRepository(EntityModel)
    private readonly entityRepository: Repository<EntityModel>,
    @InjectRepository(EntityField)
    private readonly entityFieldRepository: Repository<EntityField>,
  ) {}
  async resolvePlantEnergy(plantId: number) {
    try {
      const nominalPower = await this.entityFieldService.fetchStaticValueByTag(
        plantId,
        'Installed_Power',
      );
      const dcToAcMax = await this.entityFieldService.fetchStaticValueByTag(
        plantId,
        'dc_to_ac_max',
      );

      if (!dcToAcMax || !nominalPower) {
        throw new InternalServerErrorException(
          'Nominal power or DC-to-AC ratio is missing or undefined.',
        );
      }

      const installedPower = parseFloat(nominalPower);
      const dcToAcRatio = parseFloat(dcToAcMax);

      if (isNaN(installedPower) || isNaN(dcToAcRatio)) {
        throw new InternalServerErrorException(
          'Nominal power or DC-to-AC ratio is missing or undefined.',
        );
      }

      const plantEnergy = installedPower / dcToAcRatio;
      return { plantEnergy, installedPower, dcToAcRatio };
    } catch (error) {
      throw new InternalServerErrorException(
        'Nominal power or DC-to-AC ratio is missing or undefined.',
      );
    }
  }
  async resolveSubstationEnergy(plantId: number) {
    try {
      const nominalPower = await this.entityFieldService.fetchStaticValueByTag(
        plantId,
        'Installed_Power',
      );
      const dcToAcMax = await this.entityFieldService.fetchStaticValueByTag(
        plantId,
        'dc_to_ac_max',
      );
      if (!dcToAcMax || !nominalPower) {
        throw new InternalServerErrorException(
          'Nominal power or DC-to-AC ratio is missing or undefined.',
        );
      }
      const substations = await this.fetchPlantSubstations(plantId);
      const substationsCount = substations.length;
      if (substationsCount === 0)
        throw new InternalServerErrorException(
          'No substations are configured for this plant.',
        );
      const installedPower = parseFloat(nominalPower);
      const dcToAcRatio = parseFloat(dcToAcMax);

      if (isNaN(installedPower) || isNaN(dcToAcRatio)) {
        throw new InternalServerErrorException(
          'Nominal power or DC-to-AC ratio is missing or undefined.',
        );
      }
      const substationAcEnergy =
        installedPower / (substationsCount * dcToAcRatio);
      const substationDcEnergy = installedPower / substationsCount;
      return { substationAcEnergy, substationDcEnergy };
    } catch (error) {
      throw new InternalServerErrorException(
        'Nominal power or DC-to-AC ratio is missing or undefined.',
      );
    }
  }
  async resolvePlantPerformanceLimit(plantId: number) {
    try {
      const minIrradianceToCalculatePerformanceDataBaseResponse =
        await this.entityFieldService.fetchStaticValueByTag(
          plantId,
          'min_performance_irradiance',
        );
      const alphaFactorDataBaseResponse =
        await this.entityFieldService.fetchStaticValueByTag(
          plantId,
          'alpha_factor',
        );

      if (
        !minIrradianceToCalculatePerformanceDataBaseResponse ||
        !alphaFactorDataBaseResponse
      ) {
        throw new InternalServerErrorException(
          'min performance irradiance or alpha factor ratio is missing or undefined.',
        );
      }

      const minIrradianceToCalculatePerformance = parseFloat(
        minIrradianceToCalculatePerformanceDataBaseResponse,
      );
      const alphaFactor = parseFloat(alphaFactorDataBaseResponse);

      if (isNaN(alphaFactor) || isNaN(minIrradianceToCalculatePerformance)) {
        throw new InternalServerErrorException(
          'min performance irradiance or alpha factor ratio is missing or undefined.',
        );
      }
      return { minIrradianceToCalculatePerformance, alphaFactor };
    } catch (error) {
      throw new InternalServerErrorException(
        'Nominal power or DC-to-AC ratio is missing or undefined.',
      );
    }
  }
    async resolvePlantPerformanceRatioCredential(plantId: number) {
    try {
      const commissioningYearDataBaseResponse =
        await this.entityFieldService.fetchStaticValueByTag(
          plantId,
          'commissioning_year',
        );
      const annualPerformanceDecreasePercentDataBaseResponse =
        await this.entityFieldService.fetchStaticValueByTag(
          plantId,
          'annual_performance_decrease_percent',
        );

      if (
        !commissioningYearDataBaseResponse ||
        !annualPerformanceDecreasePercentDataBaseResponse
      ) {
        throw new InternalServerErrorException(
          'commissioning year or annual performance decrease percent ratio is missing or undefined.',
        );
      }

      const commissioningYear = parseFloat(
        commissioningYearDataBaseResponse,
      );
      const annualPerformanceDecreasePercent = parseFloat(annualPerformanceDecreasePercentDataBaseResponse);

      if (isNaN(annualPerformanceDecreasePercent) || isNaN(commissioningYear)) {
        throw new InternalServerErrorException(
              'commissioning year or annual performance decrease percent ratio is missing or undefined.',
        );
      }
      return { commissioningYear, annualPerformanceDecreasePercent };
    } catch (error) {
      throw new InternalServerErrorException(
         'commissioning year or annual performance decrease percent ratio is missing or undefined.',
      );
    }
  }
  async isInTheDay(plantId: number) {
    const plant = await this.fetchWithFleetByPlantId(plantId);
    const plantIndex = generatePlantIndex(plant.entityTag);
    const hvEntities = await this.fetchPlantHvEntity(plantId);
    const hvDevice = hvEntities.map((item) => item.entityTag.split(':')[2]);
    const elasticQuery = {
      query: {
        bool: {
          must: [
            {
              range: {
                DateTime: {
                  gte: 'now-5m',
                  lte: 'now',
                },
              },
            },
            {
              terms: {
                'DeviceName.keyword': hvDevice,
              },
            },
          ],
        },
      },
      aggs: {
        devices: {
          terms: {
            field: 'DeviceName.keyword',
            size: 10,
          },
          aggs: {
            power: {
              top_hits: {
                _source: ['P_total', 'DateTime'],
                sort: [{ DateTime: { order: 'desc' } }],
                size: 1,
              },
            },
          },
        },
      },
    };
    const response = await this.elasticService.search(plantIndex, elasticQuery);
    let power = 0;
    response.aggregations.devices.buckets.forEach((item) => {
      power = power + item.power.hits.hits[0]._source['P_total'];
    });
    if (power < 0) return true;
    return false;
  }
  async getPlants(): Promise<EntityModel[] | null> {
    const plantEntityTypes = await this.entityTypeRepository.find({
      where: {
        tag: 'Plant',
      },
    });
    return this.entityRepository.find({
      where: {
        etId: In(plantEntityTypes.map((item) => item.etId)),
      },
      relations: { fleetManager: true, entityType: true },
    });
  }

  async fetchWithFleet(uuid: string): Promise<EntityModel> {
    const plant = await this.entityRepository
      .createQueryBuilder('plant')
      .leftJoinAndSelect('plant.fleetManager', 'fleetManager')
      .leftJoinAndSelect(
        'plant.entityType',
        'entityType',
        'entityType.etId = plant.entityType',
      )
      .where('plant.uuid = :uuid', { uuid })
      .getOne();
    if (!plant || plant.entityType.tag !== 'Plant')
      throw new BadRequestException(ERROR_MESSAGES.PLANT_NOT_FOUND(uuid));
    return plant;
  }

  async fetchWithFleetByPlantId(eId: number): Promise<EntityModel> {
    const plant = await this.entityRepository
      .createQueryBuilder('plant')
      .leftJoinAndSelect('plant.fleetManager', 'fleetManager')
      .leftJoinAndSelect(
        'plant.entityType',
        'entityType',
        'entityType.etId = plant.entityType',
      )
      .where('plant.eId = :eId', { eId })
      .getOne();
    if (!plant || plant.entityType.tag !== 'Plant')
      throw new NotFoundException(`Plant not found does not exist.`);
    return plant;
  }

  async fetchPlants() {
    const plants: EntityType[] = await this.entityTypeRepository.find({
      where: {
        tag: 'Plant',
      },
      relations: {
        entities: true,
      },
    });
    return plants.map((item) => item.entities[0]);
  }

  async updateAlertEnumValues(
    schema: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const createEnumSql = `
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type t 
            JOIN pg_namespace n ON n.oid = t.typnamespace 
            WHERE t.typname = '${ALARM_LEVEL_ENUM_NAME}' 
            AND n.nspname = '${schema}'
        ) THEN
            CREATE TYPE ${schema}.${ALARM_LEVEL_ENUM_NAME} AS ENUM ('${
              Object.values(AlarmLevelEnum)[0]
            }');
        END IF;
    END $$;
    `;

    await this.plantRepoService.executeRawQuery(
      schema,
      createEnumSql,
      queryRunner,
    );

    const levels = Object.values(AlarmLevelEnum);

    const existingSql = `
    SELECT enumlabel FROM pg_enum
    JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_type.typname = '${ALARM_LEVEL_ENUM_NAME}' AND pg_namespace.nspname = '${schema}'
  `;

    const existingRows = await this.plantRepoService.executeRawQuery(
      '',
      existingSql,
      queryRunner,
    );
    const existingValues = existingRows.map((row: any) => row.enumlabel);

    const missing = levels.filter((level) => !existingValues.includes(level));
    for (const level of missing) {
      const alterSql = `ALTER TYPE ${schema}.${ALARM_LEVEL_ENUM_NAME} ADD VALUE IF NOT EXISTS '${level}'`;
      await this.plantRepoService.executeRawQuery(
        schema,
        alterSql,
        queryRunner,
      );
    }
  }
  async ensureAlertEnumValuesExistInSchemas(schemas: string[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // schemas.forEach(async (schema: string) => {
    for (const schema of schemas) {
      await this.updateAlertEnumValues(schema, queryRunner);
    }

    await queryRunner.startTransaction();
  }
  async getPlantElasticSearchIndex(
    uuid: string,
    latest = false,
  ): Promise<string> {
    const plant = await this.fetchWithFleet(uuid);
    if (!plant)
      throw new NotFoundException(ERROR_MESSAGES.PLANT_NOT_FOUND(uuid));
    const formatedDate = getFormattedDate();
    return `${plant.entityTag}-${latest ? formatedDate : '*'}`;
  }
  async getPlantElasticSearchLastDayIndex(uuid: string) {
    const plant = await this.fetchWithFleet(uuid);
    if (!plant)
      throw new NotFoundException(ERROR_MESSAGES.PLANT_NOT_FOUND(uuid));
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    return `${plant.entityTag}-${year}.${month}.${day}`;
  }
  async grantPlantAccessToAllAdmins(
    plantUuid: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const entityRepo = manager.getRepository(EntityModel);
    const userEntityAssignmentRepo =
      manager.getRepository(UserEntityAssignment);
    const plant = await entityRepo.findOne({
      where: { uuid: plantUuid },
      relations: {
        userAssignments: true,
      },
    });
    if (!plant) {
      throw new NotFoundException(`Plant with UUID ${plantUuid} not found`);
    }
    const adminUsers = await this.userService.fetchAdminUsers();
    const existingUserIds = plant.userAssignments.map((u) => u.userId);
    const newAdmins = adminUsers.filter(
      (admin) => !existingUserIds.includes(admin.id),
    );
    if (newAdmins.length > 0) {
      const schemas = newAdmins.map((user) =>
        userEntityAssignmentRepo.create({
          entityId: plant.eId,
          userId: user.id,
        }),
      );
      await userEntityAssignmentRepo.save(schemas);
    }
    //
    return true;
  }
  async revokePlantAccessFromAllAdminsTransaction(
    plantUuid: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const entityRepo = manager.getRepository(EntityModel);
    const adminUsers = await this.userService.fetchAdminUsers();
    const plantWithAdmins = await entityRepo.findOne({
      where: {
        uuid: plantUuid,
      },
      relations: {
        userAssignments: {
          user: true,
        },
      },
    });
    // if (plantWithAdmins) {
    //   plantWithAdmins.userAssignments = plantWithAdmins.userAssignments.filter(
    //     (user) => user.userAssignments.accessType.access !== AccessTypeEnum.ADMIN
    //   );

    //   await entityRepo.save(plantWithAdmins);
    // }
    return true;
  }
  async createPlantEntityTransaction(
    tag: string,
    entityName: string,
    entityType: EntityType,
    manager: EntityManager,
  ): Promise<EntityModel> {
    const entityRepo = manager.getRepository(EntityModel);

    const entity = entityRepo.create({
      entityName: entityName,
      entityTag: tag,
      parentInTreeId: 0,
      entityType,
    });
    return await entityRepo.save(entity);
  }
  async createPlantTransaction(
    tag: string,
    entityName: string,
    manager: EntityManager,
  ): Promise<EntityModel> {
    const description = `${tag} powerplant.`;
    const entityTypeRepo = manager.getRepository(EntityType);
    const entityTypeSchema = entityTypeRepo.create({
      name: 'Plant',
      tag: 'Plant',
      description,
      abstractionLevel: AbstractionLevelEnum.SECTION,
    });
    const entityType = await entityTypeRepo.save(entityTypeSchema);

    const entity = await this.createPlantEntityTransaction(
      tag,
      entityName,
      entityType,
      manager,
    );

    await entityTypeRepo.update(
      { uuid: entityType.uuid },
      {
        plantId: entity.eId,
      },
    );
    return entity;
  }
  async getPlantSetupSteps() {
    return Object.values(PlantSetupEnum);
  }

  async getPlantReport(plant: EntityModel): Promise<IPlantSetupReport> {
    const sources = await this.sourceService.read(plant.uuid);
    const entityTypesWithEntitiesAndFields =
      await this.entityTypeRepository.find({
        where: {
          plantId: plant.eId,
        },
        relations: ['entities', 'entityFields', 'entityTypeFieldSetupStatus'],
      });
    const entityTypeReports = entityTypesWithEntitiesAndFields.map(
      (entityType) => {
        const { entityTypeFieldSetupStatus, ...entityTypeData } = entityType;
        const computationalFields = entityType.entityFields.filter(
          (field) => field.isComputational,
        );
        const staticFields = entityType.entityFields.filter(
          (field) => field.isStatic,
        );
        const areFieldsInitialized = Boolean(
          entityTypeFieldSetupStatus?.isFieldsInitiated,
        );

        return {
          ...entityTypeData,
          initializedDeviceCount: entityType.entities.length,
          initializedParameterCount: entityType.entityFields.length,
          computationalFieldCount: computationalFields.length,
          staticFieldCount: staticFields.length,
          areFieldsInitialized,
        };
      },
    );

    let totalStaticFieldsCount = 0;
    let totalComputationalFieldsCount = 0;
    entityTypeReports.forEach((element) => {
      totalStaticFieldsCount += element.staticFieldCount;
      totalComputationalFieldsCount += element.computationalFieldCount;
    });

    const plantEntityFields =
      await this.entityFieldService.fetchPlantParameters(plant.uuid);
    const plantEntities = await this.entityService.fetchPlantDevices(
      plant.uuid,
    );
    const { fleetManager, ...plantData } = plant;
    const sectionEntityTypes = entityTypesWithEntitiesAndFields.filter(
      (item) => item.abstractionLevel === AbstractionLevelEnum.SECTION,
    );
    const sectionEtIds = sectionEntityTypes.map((item) => item.etId);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const devices = plantEntities.filter(
      (item) => !sectionEtIds.includes(item.etId!),
    );
    return {
      plant: plantData,
      sources,
      setupStep: fleetManager.setupStep,
      totalInitializedDeviceCount: devices.length,
      totalInitializedParameterCount: plantEntityFields.length,
      totalInitializedEntityTypeCount: entityTypeReports.length,
      totalEntityTypesWithInitializedParameters: entityTypeReports.filter(
        (report) => report.areFieldsInitialized,
      ).length,
      totalEntityTypesWithUninitializedParameters: entityTypeReports.filter(
        (report) => !report.areFieldsInitialized,
      ).length,
      totalStaticFieldsCount,
      totalComputationalFieldsCount,
      entityTypeReports: entityTypeReports.map((report) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { entities, entityFields, ...reportData } = report;
        return reportData;
      }),
    } as unknown as IPlantSetupReport;
  }
  async fetchPlantEntityTypesWithFieldSetupStatus(
    plantUuid: string,
  ): Promise<IEntityTypeWithFieldSetupStatus[]> {
    const plant = await this.fetchWithFleet(plantUuid);
    const entityTypes = await this.entityTypeRepository.find({
      where: {
        plantId: plant.eId,
        abstractionLevel: AbstractionLevelEnum.DEVICE,
      },
      relations: {
        entityTypeFieldSetupStatus: true,
      },
    });
    return entityTypes.map((item: EntityType) => {
      const areFieldsInitialized =
        item.entityTypeFieldSetupStatus?.isFieldsInitiated ?? false;

      return {
        ...item,
        areFieldsInitialized,
      };
    }) as unknown as IEntityTypeWithFieldSetupStatus[];
  }

  async getPlantDevicesFromElastic(plantUuid: string) {
    const [sources, lastDayPlantIndex, plant, entityTypes] = await Promise.all([
      this.sourceService.read(plantUuid),
      this.getPlantElasticSearchLastDayIndex(plantUuid),
      this.fetchWithFleet(plantUuid),
      this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid),
    ]);
    const distincDevices: any[] = [];
    for (const item of entityTypes) {
      const elasticQuery = buildDistictElasticDevice(item.tag);
      const result = await this.elasticService.search(
        lastDayPlantIndex,
        elasticQuery,
      );
      distincDevices.push(
        ...result.aggregations.distinct_paths.buckets.map(
          (item: any) => item.key,
        ),
      );
    }
    const elasticExtractedDevice: string[] = [];
    distincDevices.forEach((element: any) => {
      const match = element.match(/\\([^\\]+)\\/);
      const sub = sources.find((item) => item.key === match[1]);
      if (!sub) throw new InternalServerErrorException('something goes wrong');
      const device = element.match(/\\([^\\]+)\.json$/);
      elasticExtractedDevice.push(
        `${plant.entityTag}:${sub.sourceName}:${device[1]}`,
      );
    });
    return elasticExtractedDevice;
  }
  async getPlantDeviceParametersFromElasticAndPostgres(
    plantUuid: string,
  ): Promise<IPlantDeviceParametersFromElasticAndPostgres[]> {
    const [lastDayPlantIndex, entityTypesWithParameters] = await Promise.all([
      this.getPlantElasticSearchLastDayIndex(plantUuid),
      this.entityTypeService.fetchPlantDeviceEntityTypesWithParameters(
        plantUuid,
      ),
    ]);
    const result: any = [];
    for (const obj of entityTypesWithParameters) {
      const elasticQuery = buildTypeNonComputationalParameterQuery(obj.tag);
      const response = await this.elasticService.search(
        lastDayPlantIndex,
        elasticQuery,
      );
      const source = response?.hits?.hits?.[0]?._source;
      let elasticParameters: string[] = [];
      if (source) {
        elasticParameters = Object.keys(source);
      }

      result.push({
        ...obj,
        elasticParameters,
      });
    }
    return result;
  }
  async getPlantEntityTypeInitiatedDeviceInElasticAndPostgresStatus(
    plantUuid: string,
  ) {
    const [plantEntityTypes, plantDevices] = await Promise.all([
      this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid),
      this.entityService.fetchPlantDevices(plantUuid),
    ]);
    const extractedElasticDevice =
      await this.getPlantDevicesFromElastic(plantUuid);
    const tags = [
      ...new Set([
        ...plantDevices.map((item) => item.entityTag),
        ...extractedElasticDevice,
      ]),
    ];
    const initiateStates = tags.map((item) => {
      return {
        entityTag: item,
        isInitializedInElastic: extractedElasticDevice.find(
          (obj) => obj === item,
        )
          ? true
          : false,
        isInitializedInPostgres: plantDevices.find(
          (obj) => obj.entityTag === item,
        )
          ? true
          : false,
      };
    });
    return plantEntityTypes.map((item) => {
      const entities = initiateStates.filter((obj) =>
        obj.entityTag.split(':')[2].startsWith(`${item.tag}`),
      );
      const entityTypeDeviceElasticInitializationStatus =
        this.checkAllStatusTrue(entities, 'isInitializedInElastic');
      const entityTypeDevicePostgresInitializationStatus =
        this.checkAllStatusTrue(entities, 'isInitializedInPostgres');
      return {
        ...item,
        entities,
        entityTypeDevicePostgresInitializationStatus,
        entityTypeDeviceElasticInitializationStatus,
      };
    });
  }
  async getPlantEntityTypeInitiatedParameterInElasticAndPostgresStatus(
    plantUuid: string,
  ) {
    const plantEntityTypesWithParameters =
      await this.getPlantDeviceParametersFromElasticAndPostgres(plantUuid);

    return plantEntityTypesWithParameters.map((obj) => {
      let entityTypeInitializedParametersInElasticStatus = true;
      let entityTypeInitializedParametersInPostgresStatus = true;
      const { entityFields, elasticParameters, ...rest } = obj;
      const tags: string[] = [
        ...new Set([
          ...entityFields.map((item: any) => item.fieldTag),
          ...elasticParameters,
        ]),
      ];
      const initiatedParameterStatus = tags.map((item) => {
        const totalParameterObject = entityFields.find(
          (obj) => obj.fieldTag === item,
        );
        const isInitializedInElastic = elasticParameters.find(
          (obj) => obj === item,
        )
          ? true
          : false;
        const isInitializedInPostgres = entityFields.find(
          (obj: any) => obj.fieldTag === item,
        )
          ? true
          : false;
        entityTypeInitializedParametersInElasticStatus =
          entityTypeInitializedParametersInElasticStatus &&
          isInitializedInElastic;
        entityTypeInitializedParametersInPostgresStatus =
          entityTypeInitializedParametersInPostgresStatus &&
          isInitializedInPostgres;
        return {
          parameter: totalParameterObject,
          isInitializedInElastic,
          isInitializedInPostgres,
        };
      });
      return {
        enitityType: rest,
        parameterWithStatus: initiatedParameterStatus,
        entityTypeInitializedParametersInElasticStatus,
        entityTypeInitializedParametersInPostgresStatus,
      };
    });

    // return plantEntityTypes.map((item) => {
    //   const entities = initiateStates.filter((obj) =>
    //     obj.entityTag.includes(`${item.tag}`)
    //   );
    //   const postgresEntityTypeInitializedState = this.checkAllStatusTrue(
    //     entities,
    //     'isInitializedInElastic'
    //   );
    //   const elasticEntityTypeInitializedState = this.checkAllStatusTrue(
    //     entities,
    //     'isInitializedInPostgres'
    //   );
    //   return {
    //     ...item,
    //     entities,
    //     postgresEntityTypeInitializedState,
    //     elasticEntityTypeInitializedState,
    //   };
    // });

    // const [plantEntityTypes, plantDevices] = await Promise.all([
    //   this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid),
    //   this.entityFieldService.fetchPlantParameters(plantUuid),
    // ]);
    // const entityTypeWithParameters =
    //   await this.getPlantParametersFromElasticAndPostgres(plantUuid);
    //  return entityTypeWithParameters.map((obj: any) => {
    //   const { elasticParameters, entityFields } = obj;
    //   const tags = [
    //     ...new Set([
    //       ...entityFields.map((item: EntityField) => item.fieldTag),
    //       ...elasticParameters,
    //     ]),
    //   ];

    //   const initiateStates = tags.map((item) => {
    //     return {
    //       fieldTag: item,
    //       isInitializedInElastic: elasticParameters.find(
    //         (obj: string) => obj === item
    //       )
    //         ? true
    //         : false,
    //       isInitializedInPostgres: entityFields.find(
    //         (obj) => obj.fieldTag === item
    //       )
    //         ? true
    //         : false,
    //     };
    //   });
    //   return entityTypeWithParameters.map((item) => {
    //     const parameters = item.entityField
    //     const postgresEntityTypeInitializedParameterState =
    //       this.checkAllStatusTrue(parameters, 'isInitializedInElastic');
    //     const elasticEntityTypeInitializedParameterState =
    //       this.checkAllStatusTrue(parameters, 'isInitializedInPostgres');
    //     return {
    //       ...item,
    //       parameters,
    //       postgresEntityTypeInitializedParameterState,
    //       elasticEntityTypeInitializedParameterState,
    //     };
    //   });
    // });
  }
  @Cacheable()
  async generatePlantTablesName(plantIdOrUuid: string | number) {
    let plant;
    if (isNumber(plantIdOrUuid)) {
      plant = await this.fetchWithFleetByPlantId(plantIdOrUuid);
    }
    if (isString(plantIdOrUuid)) {
      plant = await this.fetchWithFleet(plantIdOrUuid);
    }
    if (!plant)
      throw new BadRequestException(
        `plant with id or uuid : ${plantIdOrUuid} is not found`,
      );
    const { entityTag: plantTag } = plant;
    const statusTable = `status.${plantTag}`;
    const stateTable = `states.${plantTag}`;
    const statusAlertTable = `status_alerts.${plantTag}`;
    const eventTable = `events.${plantTag}`;
    return { plant, eventTable, stateTable, statusTable, statusAlertTable };
  }

  generatePlantTablesByPlantTag(plantTag: string) {
    const statusTable = `status.${plantTag}`;
    const stateTable = `states.${plantTag}`;
    const statusAlertTable = `status_alerts.${plantTag}`;
    const eventTable = `events.${plantTag}`;
    return { eventTable, stateTable, statusTable, statusAlertTable };
  }

  @Cacheable()
  async fetchPlantDataDelay(plantUuid: string): Promise<number> {
    const plant = await this.fetchWithFleet(plantUuid);
    const dataDelay = await this.entityFieldService.fetchStaticValueByTag(
      plant.eId,
      'Data_Delay',
    );
    if (!dataDelay)
      throw new InternalServerErrorException(
        'data delay not found for this plant',
      );
    return parseInt(dataDelay);
  }

  @Cacheable()
  async fetchPlantIrradiationDevices(plantId: number) {
    const irradiationDevices = await this.entityRepository.find({
      where: {
        entityTag: Like('%Irradiation%'),
        entityType: {
          plantId,
        },
      },
    });
    if (plantId === 1369) return [{ entityTag: 'baft1:Substation 1:FeederIO' }];
    if (plantId === 944)
      return [{ entityTag: 'baft1:Substation 1:Irradiation' }];
    return irradiationDevices;
  }

  @Cacheable()
  async fetchPlantHvEntity(plantId: number): Promise<EntityModel[]> {
    return await this.entityRepository.find({
      where: {
        entityTag: Like('%HV1 POWER METER OUT%'),
        entityType: {
          plantId,
        },
      },
    });
  }

  @Cacheable()
  async fetchPlantSubstations(plantId: number): Promise<string[]> {
    const sources = await this.sourceService.readByPlantId(plantId);
    return sources
      .filter((item) => item.sourceName.includes('Substation'))
      .map((item) => item.sourceName);
  }

  private checkAllStatusTrue(data: any[], field: string) {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    return data.every((item) => item[field] === true);
  }
}
