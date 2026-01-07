import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  EntityField,
  EntityModel,
  EntityType,
  EntityTypeFieldSetupStatus,
  PlantFieldVisibility,
  Source,
} from 'libs/database';
import { PlantUuidDto, RevertInitializedByEntityTypeDto } from 'libs/dtos';
import { PlantSetupEnum } from 'libs/enums';
import {
  EntityService,
  EntityTypeService,
  EntityTypeBaseService,
  FleetManagerService,
  EntityFieldService,
  PlantEventService,
  PlantService,
  PlantStateService,
  PlantStatusService,
} from 'libs/modules';
import { SourceService } from 'libs/modules';
import { comparePlantSetupSteps } from 'libs/utils';
import { DataSource, EntityManager, In, QueryRunner } from 'typeorm';
@Injectable()
export class RevertInitPlantService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly plantService: PlantService,
    private readonly fleetManagerService: FleetManagerService,
    private readonly stateService: PlantStateService,
    private readonly eventService: PlantEventService,
    private readonly statusService: PlantStatusService,
    private readonly entityTypeBaseService: EntityTypeBaseService,
    private readonly sourceService: SourceService,
    private readonly entityTypeService: EntityTypeService,
    private readonly entityService: EntityService,
    private readonly entityFieldService: EntityFieldService,
  ) {}

  async revertInitPlantTag(plantUuidDto: PlantUuidDto): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const { entityType: plantEntityType } = plant;
    this.revertInitPlantSetupStepException(plant, PlantSetupEnum.InitiateTag);
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityTypeRepo = manager.getRepository(EntityType);
      const entityRepo = manager.getRepository(EntityModel);

      Object.assign(plantEntityType, { plant: null });
      await entityTypeRepo.save(plantEntityType);
      await this.fleetManagerService.deleteFleetManagerTransaction(
        plant,
        manager,
      );
      await entityRepo.remove(plant);
      await entityTypeRepo.delete({ etId: plantEntityType.etId });
    });

    return true;
  }

  async revertSources(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InitateSources,
    );
    const sources = await this.sourceService.read(plantUuid);
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const sourceRepo = manager.getRepository(Source);
      await sourceRepo.delete({
        id: In(sources.map((item) => item.id)),
      });
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InitiateTag,
        manager,
      );
    });
  }

  async revertConfirmDeviceWithSources(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.ConfirmSourceWithDevices,
    );
    await this.dataSource.transaction(async (manager: EntityManager) => {
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InitateSources,
        manager,
      );
    });
    return true;
  }

  async revertInitEntityTypes(plantUuidDto: PlantUuidDto): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityTypes,
    );
    const entities = await this.entityService.fetchPlantDevices(plantUuid);
    const entityFields =
      await this.entityFieldService.fetchPlantParameters(plantUuid);
    const entityTypes =
      await this.entityTypeService.fetchPlantDeviceEntityTypes(plantUuid);
    const weatherEntityType =
      await this.entityTypeService.fetchPlantWeatherEntityType(plantUuid);
    const allEntityTypeid = [
      ...(weatherEntityType ? [weatherEntityType] : []),
      ...entityTypes,
    ].map((item) => item.etId);

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityTypeRepo = manager.getRepository(EntityType);
      const entityRepo = manager.getRepository(EntityModel);
      const entityFieldRepo = manager.getRepository(EntityField);
      const entityTypeFieldSetupStatusRepo = manager.getRepository(
        EntityTypeFieldSetupStatus,
      );

      await entityTypeFieldSetupStatusRepo.delete({
        etId: In(allEntityTypeid),
      });
      await entityFieldRepo.delete({
        efId: In(entityFields.map((item) => item.efId)),
      });
      await entityRepo.delete({ eId: In(entities.map((item) => item.eId)) });
      await entityTypeRepo.delete({
        etId: In(
          entityTypes
            .filter((item) => item.uuid !== plant.entityType.uuid)
            .map((item) => item.etId),
        ),
      });
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.ConfirmSourceWithDevices,
        manager,
      );
    });
    return true;
  }

  async revertInitSources(plantUuidDto: PlantUuidDto): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InitateSources,
    );
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const sourceRepository = manager.getRepository(Source);
      await sourceRepository.delete({
        plantId: plant.eId,
      });
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InitiateTag,
        manager,
      );
    });
    return true;
  }

  async revertInitEntities(plantUuidDto: PlantUuidDto): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntities,
    );
    const entities = await this.entityService.fetchPlantDevices(plantUuid);
    const weatherEntity =
      await this.entityService.fetchPlantWeatherEntity(plantUuid);
    const entityIds = [
      ...entities.map((item) => item.eId),
      ...(weatherEntity?.eId ? [weatherEntity.eId] : []),
    ];
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityRepo = manager.getRepository(EntityModel);
      await entityRepo.delete({ eId: In(entityIds) });
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntityTypes,
        manager,
      );
    });
    return true;
  }
  async revertInitEntitiesStep(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntities,
    );
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntityTypes,
        manager,
      );
      return true;
    });
  }

  async revertInitializedEntitiesByType(
    revertInitializedByEntityTypeDto: RevertInitializedByEntityTypeDto,
  ): Promise<boolean> {
    const { plantUuid, etUuid } = revertInitializedByEntityTypeDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityTypes,
    );
    const entityType = await this.entityTypeBaseService.findOne(etUuid);
    if (!entityType || entityType.plantId !== plant.eId)
      throw new BadRequestException(
        'Plant UUID or entity type UUID is invalid, or they do not both belong to the same plant.',
      );

    const entities =
      await this.entityTypeService.fetchEntityTypeDevices(etUuid);

    if (entities.length === 0) return true;

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityRepo = manager.getRepository(EntityModel);

      await entityRepo.delete({
        eId: In(entities.map((item) => item.eId)),
      });
    });
    return true;
  }

  async revertInitializedFields(plantUuidDto: PlantUuidDto): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityFields,
    );
    const entityFields =
      await this.entityFieldService.fetchPlantParameters(plantUuid);

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityFieldRepo = manager.getRepository(EntityField);

      const plantFieldVisibilityRepo =
        manager.getRepository(PlantFieldVisibility);
      if (entityFields.length !== 0) {
        await plantFieldVisibilityRepo.delete({
          efId: In(entityFields.map((item) => item.efId)),
        });
        await entityFieldRepo.delete({
          efId: In(entityFields.map((item) => item.efId)),
        });
      }

      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntities,
        manager,
      );
    });
    return true;
  }
  async revertInitEntityFieldStep(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntityFields,
    );
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntities,
        manager,
      );
      return true;
    });
  }
  async revertInitializedFieldsByType(
    revertInitializedByEntityTypeDto: RevertInitializedByEntityTypeDto,
  ): Promise<boolean> {
    const { plantUuid, etUuid } = revertInitializedByEntityTypeDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.InsertEntities,
    );
    const entityType = await this.entityTypeBaseService.findOne(etUuid);
    if (!entityType || entityType.plantId !== plant.eId)
      throw new BadRequestException(
        'Plant UUID or entity type UUID is invalid, or they do not both belong to the same plant.',
      );

    const entityFields =
      await this.entityTypeService.fetchEntityTypeParameters(etUuid);

    if (entityFields.length === 0) return true;

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityFieldRepo = manager.getRepository(EntityField);
      const entityTypeFieldSetupStatus = manager.getRepository(
        EntityTypeFieldSetupStatus,
      );
      await entityFieldRepo.delete({
        efId: In(entityFields.map((item) => item.efId)),
      });
      await entityTypeFieldSetupStatus.update(
        { etId: entityType.etId },
        { isFieldsInitiated: false },
      );
    });
    return true;
  }

  async revertInitComputationalParameters(
    plantUuidDto: PlantUuidDto,
  ): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.IntStaticAndComputationalFields,
    );
    const entityFields =
      await this.entityFieldService.fetchPlantParameters(plantUuid);
    const computationalFields = entityFields.filter(
      (item) => item.isComputational === true,
    );
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityFieldRepo = manager.getRepository(EntityField);
      const plantFieldVisibilityRepo =
        manager.getRepository(PlantFieldVisibility);

      await plantFieldVisibilityRepo.delete({
        efId: In(computationalFields.map((item) => item.efId)),
      });
      await entityFieldRepo.delete({
        efId: In(computationalFields.map((item) => item.efId)),
      });
    });
    return true;
  }

  async revertInitStaticParameters(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(
      plant,
      PlantSetupEnum.IntStaticAndComputationalFields,
    );
    const entityFields =
      await this.entityFieldService.fetchPlantParameters(plantUuid);
    const staticFields = entityFields.filter((item) => item.isStatic === true);
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityFieldRepo = manager.getRepository(EntityField);
      const plantFieldVisibilityRepo =
        manager.getRepository(PlantFieldVisibility);

      await plantFieldVisibilityRepo.delete({
        efId: In(staticFields.map((item) => item.efId)),
      });
      await entityFieldRepo.delete({
        efId: In(staticFields.map((item) => item.efId)),
      });
      await this.fleetManagerService.updateFleetManagerTransaction(
        plant,
        PlantSetupEnum.InsertEntityFields,
        manager,
      );
    });
  }

  async revertAlertTablesAndAdminPlantAppend(
    plantUuidDto: PlantUuidDto,
  ): Promise<boolean> {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    this.revertInitPlantSetupStepException(plant, PlantSetupEnum.Completed);

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await this.statusService.revertStatusTables(plant, queryRunner);
    await this.stateService.revertStateTable(plant, queryRunner);
    await this.eventService.revertEventTable(plant, queryRunner);
    await this.revokeAdminAccessToPlant(plantUuidDto, queryRunner);
    await this.fleetManagerService.updateFleetManagerQueryRunnerTransaction(
      plant,
      PlantSetupEnum.IntStaticAndComputationalFields,
      queryRunner,
    );
    await queryRunner.commitTransaction();
    return true;
  }

  async revertAll(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const entityTypes =
      await this.entityTypeService.fetchPlantEntityTypes(plantUuid);
    const soildEntityTypes = entityTypes.filter(
      (item) => item.etId !== plant.entityType.etId,
    );
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const entityTypeRepo = manager.getTreeRepository(EntityType);
      const entityRepo = manager.getTreeRepository(EntityModel);
      entityTypeRepo.delete({
        etId: In(soildEntityTypes.map((item) => item.etId)),
      });
      await entityRepo.update({ eId: plant.eId }, { etId: null });
      await entityTypeRepo.delete({ etId: plant.entityType.etId });
      await entityRepo.delete({ eId: plant.eId });
      return true;
    });

    // const { plantUuid } = plantUuidDto;
    // const plant = await this.plantService.fetchWithFleet(plantUuid);

    // if (plant.fleetManager.setupStep === PlantSetupEnum.Completed) {
    //   throw new BadRequestException(
    //     'Plant setup is already completed and cannot be reverted. Please contact support for assistance.'
    //   );
    // }

    // // Define the revert steps for each setup step
    // const revertStrategies: { [key in PlantSetupEnum]?: () => Promise<void> } =
    //   {
    //     [PlantSetupEnum.IntStaticAndComputationalFields]: async () => {
    //       await this.revertInitComputationalParameters(plantUuidDto);
    //       await this.revertInitStaticParameters(plantUuidDto)
    //       await this.revertInitStaticParameters(plantUuidDto);
    //       await this.revertInitializedFields(plantUuidDto);
    //       await this.revertInitEntities(plantUuidDto);
    //       await this.revertInitEntityTypes(plantUuidDto);
    //       await this.revertInitSources(plantUuidDto);
    //       await this.revertInitPlantTag(plantUuidDto);
    //     },
    //     [PlantSetupEnum.InsertEntityFields]: async () => {
    //       await this.revertInitializedFields(plantUuidDto);
    //       await this.revertInitEntities(plantUuidDto);
    //       await this.revertInitEntityTypes(plantUuidDto);
    //       await this.revertInitSources(plantUuidDto);
    //       await this.revertInitPlantTag(plantUuidDto);
    //     },
    //     [PlantSetupEnum.InsertEntities]: async () => {
    //       await this.revertInitEntities(plantUuidDto);
    //       await this.revertInitEntityTypes(plantUuidDto);
    //       await this.revertInitSources(plantUuidDto);
    //       await this.revertInitPlantTag(plantUuidDto);
    //     },
    //     [PlantSetupEnum.InsertEntityTypes]: async () => {
    //       await this.revertInitEntityTypes(plantUuidDto);
    //       await this.revertInitSources(plantUuidDto);
    //       await this.revertInitPlantTag(plantUuidDto);
    //     },
    //     [PlantSetupEnum.InitateSources]: async () => {
    //       await this.revertInitSources(plantUuidDto);
    //       await this.revertInitPlantTag(plantUuidDto);
    //     },
    //     [PlantSetupEnum.InitiateTag]: async () => {
    //       await this.revertInitPlantTag(plantUuidDto);
    //     },
    //   };

    // const revertFunction = revertStrategies[plant.fleetManager.setupStep];

    // if (revertFunction) {
    //   await revertFunction();
    // } else {
    //   throw new BadRequestException(
    //     `Unsupported setup step for revert: ${plant.fleetManager.setupStep}`
    //   );
    // }

    // return true;
  }

  private async revokeAdminAccessToPlant(
    plantUuidDto: PlantUuidDto,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const { plantUuid } = plantUuidDto;
    const manager = queryRunner.manager;
    await this.plantService.revokePlantAccessFromAllAdminsTransaction(
      plantUuid,
      manager,
    );
  }

  private revertInitPlantSetupStepException(
    plant: EntityModel,
    plantSetupStep: PlantSetupEnum,
  ) {
    const state = comparePlantSetupSteps(
      plantSetupStep,
      plant.fleetManager.setupStep,
    );
    if (state === -1)
      throw new ConflictException(
        `Cannot proceed: setup has been reverted. Current step is "${plant.fleetManager.setupStep}".`,
      );

    if (state === 1)
      throw new BadRequestException(`the plant havent setup ${plantSetupStep}`);
  }
}
