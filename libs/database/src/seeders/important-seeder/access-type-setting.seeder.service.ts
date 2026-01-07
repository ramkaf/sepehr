import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccessTypeSettingSeeder {
  private readonly logger = new Logger(AccessTypeSettingSeeder.name);

  constructor(private dataSource: DataSource) {}

  async seed() {
    const filePath = path.join(process.cwd(), 'data/access-type-setting.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedingData = JSON.parse(rawData);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.setting_access_type (
                setting_id, access_type , "settingValue"
                ) VALUES ($1, $2 , $3)
                ON CONFLICT (setting_id, access_type) DO NOTHING`,
            [data.setting_id, data.access_type, data.settingValue],
          );
        }

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} setting_access_type.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed setting_access_type:', error.message);
      throw error;
    }
  }
}
