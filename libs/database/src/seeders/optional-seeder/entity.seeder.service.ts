import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { EntityModel } from '../../postgresql';

@Injectable()
export class EntityModelSeeder {
  private readonly logger = new Logger(EntityModelSeeder.name);

  constructor(
    @InjectRepository(EntityModel)
    private readonly repository: Repository<EntityModel>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity types already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/entity.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const entitesData = JSON.parse(rawData);
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.query(
          'ALTER TABLE main.entity ALTER COLUMN e_id DROP DEFAULT;',
        );
        for (const data of entitesData) {
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

        const result = await queryRunner.query(
          'SELECT MAX(e_id) FROM main.entity',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.entity ALTER COLUMN e_id SET DEFAULT nextval('main.entity_e_id_seq');
          SELECT setval('main.entity_e_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(`Successfully seeded ${entitesData.length} entites.`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed entites:', error.message);
      throw error;
    }
  }
}
