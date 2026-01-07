import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Company,
  EntityModel,
  FleetManager,
  PlantType,
  Province,
} from 'libs/database';
import { PlantSetupEnum } from 'libs/enums';
import { capitalizeFirstLetter, comparePlantSetupSteps } from 'libs/utils';

@Injectable()
export class FleetManagerService {
  constructor(
    @InjectRepository(FleetManager)
    private readonly fleatManagerRepository: Repository<FleetManager>,
    @InjectRepository(EntityModel)
    private readonly entityRepository: Repository<EntityModel>,
  ) {}

  async createFleetManagerTransaction(
    plant: EntityModel,
    company: Company,
    province: Province,
    plantType: PlantType,
    manager: EntityManager,
  ): Promise<FleetManager> {
    const fleetManagerRepository = manager.getRepository(FleetManager);
    const fleetManager = await fleetManagerRepository.findOne({
      where: {
        plant,
      },
    });
    if (fleetManager)
      return await this.updateFleetManagerTransactionForInitiate(
        plant,
        PlantSetupEnum.InitiateTag,
        company,
        province,
        plantType,
        manager,
      );
    const fleetManagerSchema = fleetManagerRepository.create({
      service: `${capitalizeFirstLetter(plant.entityTag)}Service`,
      setupStep: PlantSetupEnum.InitiateTag,
      plantType,
      company,
      province,
      plant,
    });
    return await fleetManagerRepository.save(fleetManagerSchema);
  }

  async updateFleetManagerTransaction(
    plant: EntityModel,
    setupStep: PlantSetupEnum,
    manager: EntityManager,
  ): Promise<FleetManager> {
    const fleetManagerRepository = manager.getRepository(FleetManager);
    await fleetManagerRepository.update(
      {
        plantId: plant.eId,
      },
      {
        setupStep,
      },
    );
    const fleetManager = await fleetManagerRepository.findOne({
      where: { plantId: plant.eId },
    });

    if (!fleetManager) {
      throw new NotFoundException(
        `FleetManager not found for plant ID ${plant.eId}`,
      );
    }

    return fleetManager;
  }
  async updateFleetManagerTransactionForInitiate(
    plant: EntityModel,
    setupStep: PlantSetupEnum,
    company: Company,
    province: Province,
    plantType: PlantType,
    manager: EntityManager,
  ): Promise<FleetManager> {
    const fleetManagerRepository = manager.getRepository(FleetManager);
    await fleetManagerRepository.update(
      {
        plantId: plant.eId,
      },
      {
        setupStep,
        company,
        plantType,
        province,
      },
    );
    const fleetManager = await fleetManagerRepository.findOne({
      where: { plantId: plant.eId },
    });

    if (!fleetManager) {
      throw new NotFoundException(
        `FleetManager not found for plant ID ${plant.eId}`,
      );
    }

    return fleetManager;
  }
  async updateFleetManagerQueryRunnerTransaction(
    plant: EntityModel,
    setupStep: PlantSetupEnum,
    queryRunner: QueryRunner,
  ): Promise<FleetManager> {
    const manager = queryRunner.manager;
    const fleetManagerRepository = manager.getRepository(FleetManager);
    await fleetManagerRepository.update(
      {
        plantId: plant.eId,
      },
      {
        setupStep,
      },
    );
    const fleetManager = await fleetManagerRepository.findOne({
      where: { plantId: plant.eId },
    });

    if (!fleetManager) {
      throw new NotFoundException(
        `FleetManager not found for plant ID ${plant.eId}`,
      );
    }

    return fleetManager;
  }
  async deleteFleatManager(plant: EntityModel) {
    return await this.fleatManagerRepository.findOne({
      where: {
        plantId: plant.eId,
      },
    });
  }
  async getFleetManager(plant: EntityModel) {
    return this.fleatManagerRepository.findOne({
      where: {
        plant,
      },
    });
  }
  async deleteFleetManagerTransaction(
    plant: EntityModel,
    manager: EntityManager,
  ) {
    const fleetManagerRepo = manager.getRepository(FleetManager);
    await fleetManagerRepo.delete({ plantId: plant.eId });
    return true;
  }
  public initPlantSetupStepException(
    plant: EntityModel,
    plantSetupStep: PlantSetupEnum,
  ) {
    const state = comparePlantSetupSteps(
      plantSetupStep,
      plant.fleetManager.setupStep,
    );
    if (state === -1)
      throw new BadRequestException('You have already completed this step.');

    if (state === 1)
      throw new ConflictException('You are not allowed to perform this setup.');
  }
  public initPlantGetServicesException(plant: EntityModel) {
    if (plant.fleetManager.setupStep === PlantSetupEnum.Completed) {
      throw new ForbiddenException(
        'this service is not allowed after plant setup is completed.',
      );
    }
  }
  async getFleets() {
    const result = await this.entityRepository.find({
      relations: ['FleetManager'],
    });
    return result.map((item) => ({
      ...item,
      ...item.fleetManager,
    }));
  }
}
