import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REDIS_INDEX_ACCESS_TYPE } from 'libs/constants';
import { RedisService } from 'libs/database';
import { AccessType } from 'libs/database';
import { AccessTypeEnum } from 'libs/enums';
import { Repository } from 'typeorm';

@Injectable()
export class AccessTypeService {
  constructor(
    @InjectRepository(AccessType)
    private readonly accessTypeRepository: Repository<AccessType>,
    private readonly redisService: RedisService,
  ) {}
  async find(): Promise<AccessType[]> {
    const cacheExist = await this.redisService.exists(REDIS_INDEX_ACCESS_TYPE);
    if (cacheExist) {
      const cacheObj = await this.redisService.getObject<AccessType[]>(
        REDIS_INDEX_ACCESS_TYPE,
      );
      if (cacheObj) return cacheObj;
    }
    const accessTypes = await this.accessTypeRepository.find();
    await this.redisService.setObject(REDIS_INDEX_ACCESS_TYPE, accessTypes);
    return accessTypes;
  }
  async findOne(access: AccessTypeEnum): Promise<AccessType | null> {
    const access_types = await this.find();
    return access_types.find((item) => item.access === access)!;
  }

  async findOneByUuid(uuid: string): Promise<AccessType | null> {
    const access_types = await this.find();
    return access_types.find((item) => item.uuid === uuid)!;
  }
}
