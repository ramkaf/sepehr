import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CollectionParamSeeder {
  private readonly logger = new Logger(CollectionParamSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    const filePath = path.join(process.cwd(), 'data/collection_params.json');

    if (!fs.existsSync(filePath)) {
      this.logger.warn('Seeding skipped: collection_params.json not found.');
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedingData = JSON.parse(rawData);

    if (!Array.isArray(seedingData) || seedingData.length === 0) {
      this.logger.warn('Seeding skipped: No data found in JSON file.');
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const data of seedingData) {
        await queryRunner.query(
          `INSERT INTO main.collection_params (collection_id, field_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING;`,
          [data.collection_id, data.field_id],
        );
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Seeded ${seedingData.length} collection_params records.`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Seeding failed:', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
