import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SoilingEntityFieldSeeder {
  private readonly logger = new Logger(SoilingEntityFieldSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    const filePath = path.join(
      process.cwd(),
      'data/soiling_entity_fields.json',
    );

    if (!fs.existsSync(filePath)) {
      this.logger.warn(
        'Seeding skipped: soiling_entity_fields.json not found.',
      );
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
          `INSERT INTO main.soiling_entity_fields (field_id, soiling_id) VALUES ($1, $2)
           ON CONFLICT DO NOTHING;`,
          [data.ef_id, data.s_id],
        );
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Seeded ${seedingData.length} soiling_entity_fields records.`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Seeding failed soiling_entity_fields:', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
