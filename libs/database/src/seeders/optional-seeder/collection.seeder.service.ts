import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CollectionEntity } from '../../postgresql';

@Injectable()
export class CollectionSeeder {
  private readonly logger = new Logger(CollectionSeeder.name);

  constructor(
    @InjectRepository(CollectionEntity)
    private readonly repository: Repository<CollectionEntity>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('collections already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/collections.json');
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
          'ALTER TABLE main.collections ALTER COLUMN c_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.collections (
      c_id, collection_name, user_id, created_at, entity_id, plant_id) VALUES (
      $1, $2, $3, $4, $5, $6
    )`,
            [
              data.c_id,
              data.collection_name,
              data.user_id,
              data.created_at,
              data.entity_id,
              data.plant_id,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(c_id) FROM main.collections',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.collections ALTER COLUMN c_id SET DEFAULT nextval('main.collections_c_id_seq');
          SELECT setval('main.collections_c_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} collections.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed collections:', error.message);
      throw error;
    }
  }
}
