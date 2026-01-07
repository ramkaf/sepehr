import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserGroupEnum } from 'libs/enums';
import { BrowserGroupEntity } from '../../postgresql';

@Injectable()
export class BrowserGroupSeeder {
  private readonly logger = new Logger(BrowserGroupSeeder.name);

  constructor(
    @InjectRepository(BrowserGroupEntity)
    private readonly bgrepository: Repository<BrowserGroupEntity>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.bgrepository.count();
    if (count > 0) {
      this.logger.log('Browser group already exists, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/entity_fields.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const browserGroupData = JSON.parse(rawData);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const browserGroups: BrowserGroupEntity[] = [];

      for (const data of browserGroupData) {
        const efId = data.ef_id;

        // Process each browser group type
        switch (data.browser_group) {
          case 'GeneralConfig': {
            const generalConfig = new BrowserGroupEntity();
            generalConfig.efId = efId;
            generalConfig.name = BrowserGroupEnum.GENERALCONFIG;
            browserGroups.push(generalConfig);
            break;
          }
          case 'Parameters': {
            const parameters = new BrowserGroupEntity();
            parameters.efId = efId;
            parameters.name = BrowserGroupEnum.PARAMETERS;
            browserGroups.push(parameters);
            break;
          }
          case 'Alarm': {
            const alarm = new BrowserGroupEntity();
            alarm.efId = efId;
            alarm.name = BrowserGroupEnum.ALARM;
            browserGroups.push(alarm);
            break;
          }
          case 'State': {
            const state = new BrowserGroupEntity();
            state.efId = efId;
            state.name = BrowserGroupEnum.STATE;
            browserGroups.push(state);
            break;
          }
          case 'Settings': {
            const settings = new BrowserGroupEntity();
            settings.efId = efId;
            settings.name = BrowserGroupEnum.SETTING;
            browserGroups.push(settings);
            break;
          }
          case 'Events': {
            const events = new BrowserGroupEntity();
            events.efId = efId;
            events.name = BrowserGroupEnum.EVENTS;
            browserGroups.push(events);
            break;
          }
          case 'Alarm&State+Parameters': {
            const stateAsp = new BrowserGroupEntity();
            stateAsp.efId = efId;
            stateAsp.name = BrowserGroupEnum.STATE;
            browserGroups.push(stateAsp);

            const alarmAsp = new BrowserGroupEntity();
            alarmAsp.efId = efId;
            alarmAsp.name = BrowserGroupEnum.ALARM;
            browserGroups.push(alarmAsp);

            const parametersAsp = new BrowserGroupEntity();
            parametersAsp.efId = efId;
            parametersAsp.name = BrowserGroupEnum.PARAMETERS;
            browserGroups.push(parametersAsp);
            break;
          }
          case 'Alarm&State': {
            const stateAs = new BrowserGroupEntity();
            stateAs.efId = efId;
            stateAs.name = BrowserGroupEnum.STATE;
            browserGroups.push(stateAs);

            const alarmAs = new BrowserGroupEntity();
            alarmAs.efId = efId;
            alarmAs.name = BrowserGroupEnum.ALARM;
            browserGroups.push(alarmAs);
            break;
          }
        }
      }

      // Save inside the transaction
      if (browserGroups.length > 0) {
        await queryRunner.manager.save(BrowserGroupEntity, browserGroups);
      }

      // Reset ID sequence
      const result = await queryRunner.query(
        'SELECT MAX(id) FROM main.browser_group',
      );
      const maxId = parseInt(result[0].max) || 0;

      await queryRunner.query(`
        ALTER TABLE main.browser_group ALTER COLUMN id SET DEFAULT nextval('main.browser_group_id_seq');
        SELECT setval('main.browser_group_id_seq', ${maxId + 1}, false);
      `);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Successfully seeded ${browserGroups.length} browser group records.`,
      );
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
