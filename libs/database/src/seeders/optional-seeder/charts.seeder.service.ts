import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Chart, User } from '../../postgresql';

@Injectable()
export class ChartSeeder {
  private readonly logger = new Logger(ChartSeeder.name);

  constructor(
    @InjectRepository(Chart)
    private readonly repository: Repository<Chart>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity types already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/charts.json');
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
          'ALTER TABLE main.charts ALTER COLUMN chart_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.charts (
      chart_id, plant_id, chart_title, chart_des, time_group, time_group_type) VALUES (
      $1, $2, $3, $4, $5, $6
    )`,
            [
              data.chart_id,
              data.plant_id,
              data.chart_title,
              data.chart_des,
              data.time_group,
              data.time_group_type,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(chart_id) FROM main.charts',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.charts ALTER COLUMN chart_id SET DEFAULT nextval('main.charts_chart_id_seq');
          SELECT setval('main.charts_chart_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(`Successfully seeded ${seedingData.length} charts.`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed charts:', error.message);
      throw error;
    }
  }
}
