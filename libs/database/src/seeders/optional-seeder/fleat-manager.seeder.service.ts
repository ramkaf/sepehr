import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { FleetManager, User } from '../../postgresql';

@Injectable()
export class FleatManagerSeeder {
  private readonly logger = new Logger(FleatManagerSeeder.name);

  constructor(
    @InjectRepository(FleetManager)
    private readonly repository: Repository<FleetManager>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('fleat-manager already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/fleet_manager.json');
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
          'ALTER TABLE main.fleet_manager ALTER COLUMN fm_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.fleet_manager (fm_id, plant_id, service
    ) VALUES (
      $1, $2, $3
    )`,
            [data.fm_id, data.plant_id, data.service],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(fm_id) FROM main.fleet_manager',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.fleet_manager ALTER COLUMN fm_id SET DEFAULT nextval('main.fleet_manager_fm_id_seq');
          SELECT setval('main.fleet_manager_fm_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} fleet_manager.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed fleet_manager:', error.message);
      throw error;
    }
  }
}
