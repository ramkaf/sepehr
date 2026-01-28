import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Chart, EntityFieldCondition, User } from '../../postgresql';

@Injectable()
export class EntityFieldConditionSeeder {
  private readonly logger = new Logger(EntityFieldConditionSeeder.name);

  constructor(
    @InjectRepository(EntityFieldCondition)
    private readonly repository: Repository<EntityFieldCondition>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log(
        'Entity Field Condition already exist, skipping seeding.',
      );
      return;
    }

    const filePath = path.join(
      process.cwd(),
      'data/entity_field_condition.json',
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
          'ALTER TABLE main.entity_field_condition ALTER COLUMN id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.entity_field_condition (
      ef_id, ef_id_depend, value, condition, id, efc_function) VALUES (
      $1, $2, $3, $4, $5, $6
    )`,
            [
              data.ef_id,
              data.ef_id_depend,
              data.value,
              data.condition,
              data.id,
              data.efc_function,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.entity_field_condition',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.entity_field_condition ALTER COLUMN id SET DEFAULT nextval('main.entity_field_condition_id_seq');
          SELECT setval('main.entity_field_condition_id_seq', ${
            maxId + 1
          }, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} entity_field_conditions.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(
        'Failed to seed Entity Field Condition:',
        error.message,
      );
      throw error;
    }
  }
}
