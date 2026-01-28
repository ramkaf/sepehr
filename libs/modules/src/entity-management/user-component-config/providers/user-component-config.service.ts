import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComponentsConfig } from 'libs/database';
import { In, Repository } from 'typeorm';
import { UserGlobalService } from '../../users/userGlobal.service';
import { PlantService } from '@app/modules/insight';
import {
  InsertMultipleUserComponentConfigDto,
  InsertUserComponentConfigDto,
  UpdateUserComponentConfigDto,
} from '@app/dtos/components';
import { FetchPlantUserDependencyDto } from '@app/dtos/chart-management';
import { MultipleUuidDto, UuidDto } from 'libs/dtos';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class UserComponentConfigService {
  constructor(
    @InjectRepository(UserComponentsConfig)
    private readonly userComponentConfigRepository: Repository<UserComponentsConfig>,
    private readonly userGlobalService: UserGlobalService,
    @Inject(forwardRef(() => PlantService))
    private readonly plantService: PlantService,
  ) {}

  async addMany(
    insertMultipleUserComponentConfigDto: InsertMultipleUserComponentConfigDto,
  ): Promise<UserComponentsConfig[]> {
    const { data } = insertMultipleUserComponentConfigDto;
    const schema: UserComponentsConfig[] = [];
    for (const item of data) {
      const { plantUuid, userUuid, ...rest } = item;
      const user = await this.userGlobalService.findOne(userUuid);
      if (!user)
        throw new BadRequestException(`user with uuid ${userUuid} not found`);
      const plant = await this.plantService.fetchPlant(plantUuid);
      const componentSchema = this.userComponentConfigRepository.create({
        ...rest,
        plant,
        user,
      });
      schema.push(componentSchema);
    }
    return await this.userComponentConfigRepository.save(schema);
  }
  async add(
    insertUserComponentConfigDto: InsertUserComponentConfigDto,
  ): Promise<UserComponentsConfig> {
    const { plantUuid, userUuid, ...rest } = insertUserComponentConfigDto;
    const user = await this.userGlobalService.findOne(userUuid);
    if (!user)
      throw new BadRequestException(`user with uuid ${userUuid} not found`);
    const plant = await this.plantService.fetchPlant(plantUuid);
    // console.log({plant , user});

    const schema = this.userComponentConfigRepository.create({
      ...rest,
      user,
      plant,
    });
    return await this.userComponentConfigRepository.save(schema);
  }
  async get(
    fetchPlantUserDependencyDto: FetchPlantUserDependencyDto,
  ): Promise<UserComponentsConfig[]> {
    const { userUuid, plantUuid } = fetchPlantUserDependencyDto;
    return await this.userComponentConfigRepository.find({
      where: {
        user: {
          uuid: userUuid,
        },
        plant: {
          uuid: plantUuid,
        },
      },
    });
  }
  async update(
    updateUserComponentConfigDto: UpdateUserComponentConfigDto,
  ): Promise<void> {
    const { uuid, ...rest } = updateUserComponentConfigDto;
    const userComponent = await this.userComponentConfigRepository.findOne({
      where: {
        uuid,
      },
    });
    if (!userComponent)
      throw new BadRequestException(ERROR_MESSAGES.COMPONENT_NOT_FOUND);
    Object.assign(userComponent, rest);
    await this.userComponentConfigRepository.save(userComponent);
  }
  async remove(uuidDto: UuidDto): Promise<void> {
    const { uuid } = uuidDto;
    await this.userComponentConfigRepository.delete({
      uuid,
    });
  }
  async removeMany(multipleUuidDto: MultipleUuidDto): Promise<void> {
    const { data } = multipleUuidDto;
    const uuids = data.map((item: UuidDto) => item.uuid);
    await this.userComponentConfigRepository.delete({
      uuid: In(uuids),
    });
  }
}
