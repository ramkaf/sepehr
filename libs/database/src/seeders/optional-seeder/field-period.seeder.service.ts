import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { EntityFieldsPeriod } from '../../postgresql';

@Injectable()
export class EntityFieldsPeriodSeeder {
  private readonly logger = new Logger(EntityFieldsPeriodSeeder.name);

  constructor(
    @InjectRepository(EntityFieldsPeriod)
    private readonly repository: Repository<EntityFieldsPeriod>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity field periods already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/fields_period.json');
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
          'ALTER TABLE main.fields_period ALTER COLUMN id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.fields_period (
      id, ef_id, range_value, range_type
    ) VALUES (
      $1, $2, $3, $4
    )`,
            [data.id, data.ef_id, data.range_value, data.range_type],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.fields_period',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.fields_period ALTER COLUMN id SET DEFAULT nextval('main.fields_period_id_seq');
          SELECT setval('main.fields_period_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} fields_period.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed fields_period:', error.message);
      throw error;
    }
  }
}
