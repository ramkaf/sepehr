import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BookmarkField, User } from '../../postgresql';

@Injectable()
export class BookmarkFieldSeeder {
  private readonly logger = new Logger(BookmarkFieldSeeder.name);

  constructor(
    @InjectRepository(BookmarkField)
    private readonly repository: Repository<BookmarkField>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Bookmark field already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/bookmark_field.json');
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
          'ALTER TABLE main.bookmark_field ALTER COLUMN id DROP DEFAULT;',
        );

        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.bookmark_field (user_id,createdat, description, id, ef_id
    ) VALUES (
      $1, $2, $3, $4, $5
    )`,
            [
              data.user_id,
              data.createdat || new Date().toISOString(),
              data.description,
              data.id,
              data.ef_id,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.bookmark_field',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.bookmark_field ALTER COLUMN id SET DEFAULT nextval('main.bookmark_field_id_seq');
          SELECT setval('main.bookmark_field_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} bookmark_field.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed bookmark_field:', error.message);
      throw error;
    }
  }
}
