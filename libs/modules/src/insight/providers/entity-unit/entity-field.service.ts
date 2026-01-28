import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BrowserGroupEntity,
  Cacheable,
  EntityField,
  EntityFieldSchema,
  EntityFieldsPeriod,
} from 'libs/database';
import { In, Like, Not, Repository } from 'typeorm';
import {
  EntityBaseService,
  EntityFieldBaseService,
} from '../../../entity-management';
import { EntityTypeService } from './entity-type.service';
import { PlantService } from '../plant-unit/plants.service';
import { BrowserGroupEnum } from 'libs/enums';

@Injectable()
export class EntityFieldService {
  constructor(
    @InjectRepository(EntityField)
    private readonly entityFieldRepository: Repository<EntityField>,
    @InjectRepository(EntityFieldSchema)
    private readonly entityFieldSchemaRepository: Repository<EntityFieldSchema>,
    @Inject(forwardRef(() => EntityFieldBaseService))
    private readonly entityFieldBaseService: EntityFieldBaseService,
    @Inject(forwardRef(() => EntityBaseService))
    private readonly entityBaseService: EntityBaseService,
    @Inject(forwardRef(() => EntityTypeService))
    private readonly entityTypeService: EntityTypeService,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
  ) {}

  @Cacheable('24h')
  async fetchPlantParameters(plantUuid: string): Promise<EntityField[]> {
    const entityTypes =
      await this.entityTypeService.fetchPlantEntityTypes(plantUuid);
    return await this.entityFieldRepository.find({
      where: {
        etId: In(entityTypes.map((item) => item.etId)),
      },
    });
  }
  @Cacheable('24h')
  async fetchPlantBrowserGroupParameters(
    plantUuid: string,
    browserGroup: BrowserGroupEnum,
  ) {
    const parameters = await this.fetchPlantParameters(plantUuid);
    return parameters.filter((ef: EntityField) =>
      ef.browserGroup.some(
        (bg: BrowserGroupEntity) => bg.name === browserGroup,
      ),
    );
  }
  @Cacheable('24h')
  async fetchStaticParameters(plantUuid: string) {
    const parameters = await this.fetchPlantParameters(plantUuid);
    return parameters.filter((item) => item.isStatic);
  }

  @Cacheable('24h')
  async fetchDeviceComputationalParameters(eUuid: string) {
    const entity = await this.entityBaseService.findOneWithType(eUuid);
    if (!entity)
      throw new BadRequestException(`entity with uuid : ${eUuid} not found`);
    const parameters =
      await this.entityFieldBaseService.findEntityTypeParameters(
        entity.entityType.uuid,
      );
    return parameters.filter((item) => item.isComputational);
  }

  @Cacheable('24h')
  async fetchDeviceEntityFields(eUuid: string) {
    const entity = await this.entityBaseService.findOne(eUuid);
    if (!entity || !entity.etId)
      throw new BadRequestException(`entity with uuid : ${eUuid} not found`);
    return await this.entityFieldRepository.find({
      where: {
        etId: entity.etId,
      },
    });
  }

  @Cacheable('24h')
  async fetchInitiatedWeatherParameters(
    plantUuid: string,
    base: 'Plant' | 'Entity',
  ) {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    const weatherPredictionEntityType =
      await this.entityTypeService.fetchPlantWeatherEntityType(plantUuid);
    if (!weatherPredictionEntityType)
      throw new BadRequestException('something goes wrong');
    const etId =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      base === 'Plant' ? plant.etId! : weatherPredictionEntityType.etId;
    return await this.entityFieldRepository.find({
      where: {
        etId,
        fieldTag: Like('%weather%'),
      },
    });
  }
  @Cacheable('24h')
  async fetchStaticParametersSchema(): Promise<EntityFieldSchema[]> {
    return await this.entityFieldSchemaRepository.find({
      where: {
        isStatic: true,
      },
    });
  }
  @Cacheable('24h')
  async fetchWeatherParametersSchema(): Promise<EntityFieldSchema[]> {
    return await this.entityFieldSchemaRepository.find({
      where: {
        isComputational: true,
        fieldTag: Like('%weather%'),
      },
    });
  }
  @Cacheable('1d')
  async fetchComputationalParametersSchema(): Promise<EntityFieldSchema[]> {
    return this.entityFieldSchemaRepository.find({
      where: {
        isComputational: true,
        fieldTag: Not(Like('%weather%')),
      },
    });
  }
  @Cacheable('24h')
  async fetchStaticValueByTag(plantId: number, fieldTag: string) {
    const field = await this.fetchPlantEntityFieldByTag(plantId, fieldTag);
    const value = field ? field.staticValue : null;
    return { value, field };
  }

  @Cacheable('24h')
  async fetchPlantEntityFieldUnitByTag(
    plantId: number,
    fieldTag: string,
  ): Promise<string | null> {
    const field = await this.fetchPlantEntityFieldByTag(plantId, fieldTag);
    return field ? field.unit : null;
  }

  @Cacheable('1h')
  async fetchPlantEntityFieldByTag(
    plantId: number,
    fieldTag: string,
  ): Promise<EntityField | null> {
    return await this.entityFieldRepository.findOne({
      where: {
        fieldTag,
        entityType: {
          plantId,
        },
      },
    });
  }
  @Cacheable('24h')
  async fetchHvPowerParameter(plantId: number): Promise<EntityField | null> {
    return await this.entityFieldRepository.findOne({
      where: {
        fieldTag: 'P_total',
        entityType: {
          plantId,
          tag: Like('%HV1 POWER METER%'),
        },
      },
    });
  }

  @Cacheable('24h')
  async fetchIonParameter(plantId: number): Promise<EntityField | null> {
    return await this.entityFieldRepository.findOne({
      where: {
        fieldTag: 'kW_tot',
        entityType: {
          plantId,
          tag: Like('%ION METER%'),
        },
      },
    });
  }

  @Cacheable()
  async fetchStringsPowerVoltageAndCurrentParameters(
    etId: number,
  ): Promise<string[]> {
    const parameters = await this.entityFieldRepository.find({
      where: {
        nestAllValuesFunctionName: 'stringPowerAllValues',
        entityType: {
          etId,
        },
      },
      order: {
        efId: 'ASC',
      },
    });
    return parameters
      .map((item) => {
        const match = item.fieldTag.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((num): num is number => num !== null)
      .sort((a, b) => a - b)
      .flatMap((item) => {
        const currentParameter = `PV${item}_current`;
        const voltageParameter = `PV${item}_voltage`;
        return [currentParameter, voltageParameter];
      });
  }

  @Cacheable()
  async fetchParameterPeriod(efId: number): Promise<EntityFieldsPeriod | null> {
    const parameter = await this.entityFieldRepository.findOne({
      where: {
        efId,
      },
      relations: {
        fieldsPeriod: true,
      },
    });
    return parameter?.fieldsPeriod ?? null;
  }

  @Cacheable()
  async fetchPlantAssetsParameter(plantUuid: string) {
    const plant = await this.plantService.fetchWithFleet(plantUuid);
    return await this.entityFieldRepository.find({
      where: {
        browserGroup: {
          name: BrowserGroupEnum.ASSETS,
        },
        entityType: {
          plantId: plant.eId,
        },
      },
    });
  }
}
