import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PlantService } from '../plant-unit/plants.service';
import { EntityService } from './entity.service';
import { EntityField, EntityModel, EntityType } from 'libs/database';
import { AbstractionLevelEnum } from 'libs/enums';
import {
  IAllEntityTypesWithPlantTag,
  IEntityTypeWithFieldSetupStatus,
  IPlantDeviceEntityTypesWithParameters,
} from 'libs/interfaces';
@Injectable()
export class EntityTypeService {
  constructor(
    @InjectRepository(EntityType)
    private readonly entityTypeRepository: Repository<EntityType>,
    @InjectRepository(EntityModel)
    private readonly entityRepository: Repository<EntityModel>,
    @InjectRepository(EntityField)
    private readonly entityFieldRepository: Repository<EntityField>,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
  ) {}

  async fetchEntityTypeDevices(etUuid: string) {
    const entityType = await this.entityTypeRepository.findOne({
      where: { uuid: etUuid },
    });
    if (!entityType)
      throw new BadRequestException(`entity Type uuid is not valid`);
    const result = await this.entityRepository.find({
      where: {
        entityType,
      },
    });
    return result;
  }

  async fetchEntityTypeParameters(etUuid: string) {
    return await this.entityFieldRepository.find({
      where: {
        entityType: {
          uuid: etUuid,
        },
      },
    });
  }
  async fetchPlantDeviceEntityTypes(plantUuid: string): Promise<EntityType[]> {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.entityTypeRepository.find({
      where: {
        plantId: plant.eId,
        abstractionLevel: AbstractionLevelEnum.DEVICE,
      },
    });
  }
  async fetchPlantDeviceEntityTypesWithParameters(plantUuid: string) {
    // : Promise<IPlantDeviceEntityTypesWithParameters[]>
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.entityTypeRepository.find({
      where: {
        plantId: plant.eId,
        abstractionLevel: AbstractionLevelEnum.DEVICE,
        entityFields: {
          isStatic: false,
          isComputational: false,
        },
      },
      relations: {
        entityFields: true,
      },
    });
  }
  async fetchPlantEntityTypes(plantUuid: string): Promise<EntityType[]> {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.entityTypeRepository.find({
      where: {
        plantId: plant.eId,
      },
    });
  }

  async fetchPlantEntityTypesWithPlantTag() {
    // : Promise< IAllEntityTypesWithPlantTag[] >
    const entityTypes = await this.entityTypeRepository.find();
    const entites = await this.entityRepository.find();
    return entityTypes.map((item: EntityType) => {
      const plantEntity = entites.find((obj) => obj.eId === item.plantId);
      if (!plantEntity) throw new ConflictException('somethings goes wrong');
      return {
        ...item,
        plantTag: plantEntity.entityTag,
        plantUuid: plantEntity.uuid,
      };
    });
  }

  async fetchPlantEntityTypesWithFieldSetupStatus(plantUuid: string) {
    // : Promise<IEntityTypeWithFieldSetupStatus[]>
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const entityTypes = await this.entityTypeRepository.find({
      where: {
        plantId: plant.eId,
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
    });
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
  async initiateWeatherPredictionEntityAndEntityType(
    plantUuid: string,
    manager: EntityManager,
  ) {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    let weatherEntityType = await this.fetchPlantWeatherEntityType(plant.uuid);
    let weatherEntity = await this.entityService.fetchPlantWeatherEntity(
      plant.uuid,
    );
    const entityRepo = manager.getRepository(EntityModel);
    const entityTypeRepo = manager.getRepository(EntityType);
    if (!weatherEntityType) {
      const weatherEntityTypeSchema = entityTypeRepo.create({
        plantId: plant.eId,
        tag: 'Weather_prediction',
        name: 'Weather prediction',
        description: 'Weather prediction',
        abstractionLevel: AbstractionLevelEnum.SECTION,
      });
      weatherEntityType = await entityTypeRepo.save(weatherEntityTypeSchema);
    }
    if (!weatherEntity) {
      const weatherEntitySchema = entityRepo.create({
        entityType: weatherEntityType,
        entityTag: `${plant.entityTag}:Weather_Prediction`,
        entityName: 'Weather Prediction',
        parentInTreeId: null,
      });
      weatherEntity = await entityRepo.save(weatherEntitySchema);
    }
  }
  async findAllPlantEntityTypesWithPlantTag(): Promise<
    IAllEntityTypesWithPlantTag[]
  > {
    const entityTypes = await this.entityTypeRepository.find({
      where: { abstractionLevel: AbstractionLevelEnum.DEVICE },
    });
    const entites = await this.entityRepository.find();
    return entityTypes.map((item: any) => {
      const plantEntity = entites.find((obj) => obj.eId === item.plantId);
      if (!plantEntity) {
        throw new ConflictException('somethings goes wrong');
      }
      return {
        ...item,
        plantTag: plantEntity.entityTag,
        plantUuid: plantEntity.uuid,
      };
    });
  }
}
