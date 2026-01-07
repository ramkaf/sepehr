import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AccessTypeEnum } from 'libs/enums';
import { AccessType } from '../../postgresql';

@Injectable()
export class AccessTypeSeeder {
  private readonly logger = new Logger(AccessTypeSeeder.name);

  constructor(
    @InjectRepository(AccessType)
    private readonly repository: Repository<AccessType>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('access_type already exist, skipping seeding.');
      return;
    }

    // const filePath = path.join(process.cwd(), 'data/access_type.json');
    // const rawData = fs.readFileSync(filePath, 'utf8');
    // const seedingData = JSON.parse(rawData);
    const seedingData = Object.values(AccessTypeEnum);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Temporarily disable the auto-increment behavior
        await queryRunner.query(
          'ALTER TABLE main.access_type ALTER COLUMN id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (let i = 0; i < seedingData.length; i++) {
          await queryRunner.query(
            `INSERT INTO main.access_type (id, access) VALUES ($1, $2)`,
            [i + 1, seedingData[i]],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.access_type',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.access_type ALTER COLUMN id SET DEFAULT nextval('main.access_type_id_seq');
          SELECT setval('main.access_type_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} access_type.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed access_type:', error.message);
      throw error;
    }
  }
}
