import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessTypeService } from './access-type.service';
import {
  REDIS_INDEX_ACCESS_TYPE_SETTINGS,
  REDIS_INDEX_SETTINGS,
} from 'libs/constants';
import { AccessTypeSetting, RedisService, Settings } from 'libs/database';
import { UpdateSettingDto } from 'libs/dtos';
import { AccessTypeEnum, SettingKeysEnum } from 'libs/enums';
import { parseTimeToSeconds } from 'libs/utils';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(AccessTypeSetting)
    private readonly accessTypeSettingRepository: Repository<AccessTypeSetting>,
    @InjectRepository(Settings)
    private readonly settingRepository: Repository<Settings>,
    private readonly redisService: RedisService,
    private readonly accessTypeService: AccessTypeService,
  ) {}

  async find(): Promise<AccessTypeSetting[]> {
    const cacheExist = await this.redisService.exists(
      REDIS_INDEX_ACCESS_TYPE_SETTINGS,
    );
    if (cacheExist) {
      const cacheObj = await this.redisService.getObject<AccessTypeSetting[]>(
        REDIS_INDEX_ACCESS_TYPE_SETTINGS,
      );
      if (cacheObj) return cacheObj;
    }
    return await this.updateAccessTypeSettingCache();
  }
  async findOne(title: string): Promise<AccessTypeSetting | null> {
    const accessTypeSettings = await this.find();
    const accessTypeSetting = accessTypeSettings.find(
      (item) => item.setting.title === title,
    );
    if (accessTypeSetting === undefined) return null;
    return accessTypeSetting;
  }
  async findSettings(): Promise<Settings[]> {
    const cacheExist = await this.redisService.exists(REDIS_INDEX_SETTINGS);
    if (cacheExist) {
      const cacheObj =
        await this.redisService.getObject<Settings[]>(REDIS_INDEX_SETTINGS);
      if (cacheObj) return cacheObj;
    }
    return await this.updateSettingCache();
  }
  async getAccessTypeSettingTree() {
    // Fetch all AccessTypeSetting entries with relations
    const allSettings = await this.accessTypeSettingRepository.find({
      relations: ['accessType', 'setting', 'setting.section'],
    });

    // Group by AccessType
    const grouped = new Map<number, any>();

    for (const row of allSettings) {
      const { accessType, setting, settingValue } = row;

      if (!grouped.has(accessType.id)) {
        grouped.set(accessType.id, {
          accessType: accessType.access, // Assuming `name` exists
          settings: [],
        });
      }

      grouped.get(accessType.id).settings.push({
        uuid: setting.uuid,
        title: setting.title,
        description: setting.description,
        valueType: setting.valueType,
        settingValue,
      });
    }

    return Array.from(grouped.values());
  }
  async findOneSetting(title: string): Promise<Settings | null> {
    const settings = await this.findSettings();
    const setting = settings.find((item) => item.title === title);
    if (setting === undefined) return null;
    return setting;
  }
  async getAccessTypeSetting(access: AccessTypeEnum) {
    const settings = await this.find();
    const accessObj = await this.accessTypeService.findOne(access);
    return settings.find((item) => item.accessType === accessObj);
  }
  async getSettingValue(
    access: AccessTypeEnum,
    settingTitle: string,
  ): Promise<string> {
    const setting = await this.findOneSetting(settingTitle);
    const accessType = await this.accessTypeService.findOne(access);
    if (!setting || !accessType)
      throw new InternalServerErrorException('setting with this access');
    const accessTypeSettings = await this.find();
    const settingObj: AccessTypeSetting | undefined = accessTypeSettings.find(
      (item) =>
        item.accessType.access === access &&
        item.setting.title === settingTitle,
    );
    if (settingObj === undefined || !settingObj)
      throw new InternalServerErrorException(
        'setting with this access not defined',
      );
    return settingObj.settingValue;
  }
  async updateSettingCache() {
    const data = await this.settingRepository.find({
      relations: {
        section: true,
      },
    });
    await this.redisService.setObject(REDIS_INDEX_SETTINGS, data);
    return data;
  }
  async updateAccessTypeSettingCache() {
    const data = await this.accessTypeSettingRepository.find({
      relations: {
        accessType: true,
        setting: {
          section: true,
        },
      },
    });
    await this.redisService.setObject(REDIS_INDEX_ACCESS_TYPE_SETTINGS, data);
    return data;
  }
  async getTtlSettings(
    access: AccessTypeEnum,
    settingTitle: SettingKeysEnum,
  ): Promise<number> {
    const settingValue = await this.getSettingValue(access, settingTitle);
    if (!settingValue)
      throw new InternalServerErrorException('settings its not defined yet');
    const ttlSeconds = parseTimeToSeconds(settingValue);
    return ttlSeconds;
  }
  async getNumberSetting(
    access: AccessTypeEnum,
    settingTitle: SettingKeysEnum,
  ) {
    const settingValue = await this.getSettingValue(access, settingTitle);
    return parseInt(settingValue);
  }
  async update(updateSettingDto: UpdateSettingDto) {
    const { settingUuid, accessType, settingValue } = updateSettingDto;
    const setting = await this.settingRepository.findOne({
      where: { uuid: settingUuid },
    });
    if (!setting) throw new NotFoundException('Setting not found');

    const accessTypeObj = await this.accessTypeService.findOne(accessType);
    if (!accessTypeObj) throw new NotFoundException('access Type not found');

    await this.accessTypeSettingRepository.update(
      {
        settingId: setting.id,
        accessTypeId: accessTypeObj.id,
      },
      {
        settingValue,
      },
    );
    await this.updateAccessTypeSettingCache();
    return true;
  }
}
