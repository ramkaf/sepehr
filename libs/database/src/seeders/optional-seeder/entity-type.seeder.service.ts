import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { EntityType } from '../../postgresql';

@Injectable()
export class EntityTypeSeeder {
  private readonly logger = new Logger(EntityTypeSeeder.name);

  constructor(
    @InjectRepository(EntityType)
    private readonly repository: Repository<EntityType>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity types already exist, skipping seeding.');
      return;
    }

    const entityTypeFilePath = path.join(
      process.cwd(),
      'data/entity_types.json',
    );
    const entityTypeRawData = fs.readFileSync(entityTypeFilePath, 'utf8');
    const entityFilePath = path.join(process.cwd(), 'data/entity.json');
    const entityRawData = fs.readFileSync(entityFilePath, 'utf8');
    const entityTypesData = JSON.parse(entityTypeRawData);
    const entityData = JSON.parse(entityRawData);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Temporarily disable the auto-increment behavior
        await queryRunner.query(
          'ALTER TABLE main.entity_types ALTER COLUMN et_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of entityTypesData) {
          await queryRunner.query(
            `INSERT INTO main.entity_types (et_id, name, tag, description, abstraction_level, plant_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              data.et_id,
              data.name,
              data.tag,
              data.description,
              data.abstraction_level,
              null,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(et_id) FROM main.entity_types',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.entity_types ALTER COLUMN et_id SET DEFAULT nextval('main.entity_types_et_id_seq');
          SELECT setval('main.entity_types_et_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.query(
          'ALTER TABLE main.entity ALTER COLUMN e_id DROP DEFAULT;',
        );
        for (const data of entityData) {
          await queryRunner.query(
            `INSERT INTO main.entity (e_id, entity_name, entity_tag, parent_in_tree_id, entity_type_id) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
              data.e_id,
              data.entity_name,
              data.entity_tag,
              data.parent_in_tree_id,
              data.entity_type_id,
            ],
          );
        }

        const resultE = await queryRunner.query(
          'SELECT MAX(e_id) FROM main.entity',
        );
        const maxIdE = parseInt(resultE[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.entity ALTER COLUMN e_id SET DEFAULT nextval('main.entity_e_id_seq');
          SELECT setval('main.entity_e_id_seq', ${maxIdE + 1}, false);
        `);

        for (const data of entityTypesData) {
          await queryRunner.query(
            `UPDATE main.entity_types SET plant_id = $1 WHERE et_id = $2`,
            [data.plant_id, data.et_id],
          );
        }

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${entityData.length} entites and ${entityTypesData.length} entity Type.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed entity types:', error.message);
      throw error;
    }
  }
}
