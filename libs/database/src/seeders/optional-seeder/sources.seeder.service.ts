import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Source } from '../../postgresql';

@Injectable()
export class SourceSeeder {
  private readonly logger = new Logger(SourceSeeder.name);

  constructor(
    @InjectRepository(Source)
    private readonly repository: Repository<Source>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity types already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/sources.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Insert data with specific IDs
        for (const item of data) {
          await queryRunner.query(
            `INSERT INTO main.sources ( key, source_name, plant_id) 
             VALUES ( $1, $2, $3)`,
            [item.key, item.source_name, item.plant_id],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.sources',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.sources ALTER COLUMN id SET DEFAULT nextval('main.sources_id_seq');
          SELECT setval('main.sources_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(`Successfully seeded ${data.length} sources.`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed sources:', error.message);
      throw error;
    }
  }
}
