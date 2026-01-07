import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Chart, ChartDetail, ChartEntity, User } from '../../postgresql';

@Injectable()
export class ChartEntitySeeder {
  private readonly logger = new Logger(ChartEntitySeeder.name);

  constructor(
    @InjectRepository(ChartEntity)
    private readonly repository: Repository<ChartEntity>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Chart entities already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/chart_entities.json');
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
          'ALTER TABLE main.chart_entities ALTER COLUMN che_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.chart_entities (
      che_id, detail_id, entity_id, chart_entity_title) VALUES (
      $1, $2, $3, $4
    )`,
            [
              data.che_id,
              data.detail_id,
              data.entity_id,
              data.chart_entity_title,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(che_id) FROM main.chart_entities',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.chart_entities ALTER COLUMN che_id SET DEFAULT nextval('main.chart_entities_che_id_seq');
          SELECT setval('main.chart_entities_che_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} chart entities.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed chart entities:', error.message);
      throw error;
    }
  }
}
