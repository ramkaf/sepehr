import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Chart, User, UserComponentsConfig } from '../../postgresql';

@Injectable()
export class UserComponentConfigSeeder {
  private readonly logger = new Logger(UserComponentConfigSeeder.name);

  constructor(
    @InjectRepository(UserComponentsConfig)
    private readonly repository: Repository<UserComponentsConfig>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('User Component Config already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(
      process.cwd(),
      'data/user_components_config.json',
    );
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
          'ALTER TABLE main.user_components_config ALTER COLUMN ucc_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.user_components_config (
      ucc_id, user_id, component_tag, x, y, rows , cols , component_title , plant_id) VALUES (
      $1, $2, $3, $4, $5, $6,$7,$8,$9
    )`,
            [
              data.ucc_id,
              data.user_id,
              data.component_tag,
              data.x,
              data.y,
              data.rows,
              data.cols,
              data.component_title,
              data.plant_id,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(ucc_id) FROM main.user_components_config',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.user_components_config ALTER COLUMN ucc_id SET DEFAULT nextval('main.user_components_config_ucc_id_seq');
          SELECT setval('main.user_components_config_ucc_id_seq', ${
            maxId + 1
          }, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} user_components_config.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(
        'Failed to seed user_components_config:',
        error.message,
      );
      throw error;
    }
  }
}
