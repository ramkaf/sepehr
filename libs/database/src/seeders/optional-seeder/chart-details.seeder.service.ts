import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Chart, ChartDetail, User } from '../../postgresql';

@Injectable()
export class ChartDetailSeeder {
  private readonly logger = new Logger(ChartDetailSeeder.name);

  constructor(
    @InjectRepository(ChartDetail)
    private readonly repository: Repository<ChartDetail>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Chart details already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/chart_details.json');
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
          'ALTER TABLE main.chart_details ALTER COLUMN detail_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.chart_details (
      detail_id, detail_title, detail_des, group_type, chart_id, entity_type_id) VALUES (
      $1, $2, $3, $4, $5, $6
    )`,
            [
              data.detail_id,
              data.detail_title,
              data.detail_des,
              data.group_type,
              data.chart_id,
              data.entity_type_id,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(detail_id) FROM main.chart_details',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.chart_details ALTER COLUMN detail_id SET DEFAULT nextval('main.chart_details_detail_id_seq');
          SELECT setval('main.chart_details_detail_id_seq', ${
            maxId + 1
          }, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} chart details.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed chart details:', error.message);
      throw error;
    }
  }
}
