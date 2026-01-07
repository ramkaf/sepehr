import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Chart, Soiling, User } from '../../postgresql';

@Injectable()
export class SoilingSeeder {
  private readonly logger = new Logger(SoilingSeeder.name);

  constructor(
    @InjectRepository(Soiling)
    private readonly repository: Repository<Soiling>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Soilings already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/soiling.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedingData = JSON.parse(rawData);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Temporarily disable the auto-increment behavior
        await queryRunner.query(
          'ALTER TABLE main.soiling ALTER COLUMN id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.soiling (
      id, title, base_entity, plant_id, user_id, et_id , base_string_voltage ,base_string_current) VALUES (
      $1, $2, $3, $4, $5, $6,$7,$8
    )`,
            [
              data.id,
              data.title,
              data.base_entity,
              data.plant_id,
              data.user_id,
              data.et_id,
              data.base_string_voltage,
              data.base_string_current,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.soiling',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.soiling ALTER COLUMN id SET DEFAULT nextval('main.soiling_id_seq');
          SELECT setval('main.soiling_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(`Successfully seeded ${seedingData.length} soilings.`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed soilings:', error.message);
      throw error;
    }
  }
}
