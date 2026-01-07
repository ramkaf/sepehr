import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { SettingSection } from '../../postgresql';

@Injectable()
export class SettingSectionSeeder {
  private readonly logger = new Logger(SettingSectionSeeder.name);

  constructor(
    @InjectRepository(SettingSection)
    private readonly repository: Repository<SettingSection>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('setting section already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/setting-section.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedingData = JSON.parse(rawData);
    // const seedingData = Object.values(AccessTypeEnum);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Temporarily disable the auto-increment behavior
        await queryRunner.query(
          'ALTER TABLE main.setting_section ALTER COLUMN id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.setting_section (
      id, title, description) VALUES (
      $1, $2, $3
    )`,
            [data.id, data.title, data.description],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.setting_section',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.setting_section ALTER COLUMN id SET DEFAULT nextval('main.setting_section_id_seq');
          SELECT setval('main.setting_section_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} setting_section.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed setting_section:', error.message);
      throw error;
    }
  }
}
