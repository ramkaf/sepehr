import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { UserChart } from '../../postgresql';

@Injectable()
export class UserChartSeeder {
  private readonly logger = new Logger(UserChartSeeder.name);

  constructor(
    @InjectRepository(UserChart)
    private readonly repository: Repository<UserChart>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('user charts already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/user_charts.json');
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
          'ALTER TABLE main.user_charts ALTER COLUMN uch_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.user_charts (
      uch_id, user_id, chart_id, x, y, cols,rows) VALUES (
      $1, $2, $3, $4, $5, $6,$7
    )`,
            [
              data.uch_id,
              data.user_id,
              data.chart_id,
              data.x,
              data.y,
              data.cols,
              data.rows,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(uch_id) FROM main.user_charts',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.user_charts ALTER COLUMN uch_id SET DEFAULT nextval('main.user_charts_uch_id_seq');
          SELECT setval('main.user_charts_uch_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} user charts.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed user charts:', error.message);
      throw error;
    }
  }
}
