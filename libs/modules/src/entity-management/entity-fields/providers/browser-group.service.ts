import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BrowserGroupEntity, EntityField } from 'libs/database';
import { BaseService } from '../../common/providers/base.service';
import { BrowserGroupEnum } from 'libs/enums';

@Injectable()
export class BrowserGroupService extends BaseService<BrowserGroupEntity> {
  constructor(
    @InjectRepository(BrowserGroupEntity)
    private readonly browserGroupRepository: Repository<BrowserGroupEntity>,
  ) {
    super(browserGroupRepository, 'Browser Group');
  }

  async createBrowserGroup(
    browserGroupSchema: BrowserGroupEnum,
    entityField: EntityField,
  ) {
    return await this.create({ name: browserGroupSchema, ...entityField });
  }

  async createBrowserGroupTransaction(
    browserGroup: BrowserGroupEnum,
    entityField: EntityField,
    manager: EntityManager,
  ) {
    const browserGroupRepo = manager.getRepository(BrowserGroupEntity);
    const browserGroupSchema = browserGroupRepo.create({
      name: browserGroup,
      ...entityField,
    });
    return await browserGroupRepo.save(browserGroupSchema);
  }

  async fetchBrowserGroupOptions(): Promise<BrowserGroupEnum[]> {
    const browserGroups = await this.browserGroupRepository
      .createQueryBuilder('bg')
      .select('DISTINCT bg.name', 'name')
      .getRawMany();

    return browserGroups.map((group) => group.name);
  }
}
