import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserGroupEntity, EntityField } from '../../postgresql';

@Injectable()
export class EntityFieldSeeder {
  private readonly logger = new Logger(EntityFieldSeeder.name);

  constructor(
    @InjectRepository(EntityField)
    private readonly repository: Repository<EntityField>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity fields already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/entity_fields.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const entityFieldData = JSON.parse(rawData);

    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Temporarily disable the auto-increment behavior
        await queryRunner.query(
          'ALTER TABLE main.entity_fields ALTER COLUMN ef_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of entityFieldData) {
          await queryRunner.query(
            `INSERT INTO main.entity_fields (
       field_title,
       field_tag,
       unit,
       is_computational,
       last_value_function_name,
       all_values_function_name,
       is_static,
       static_value,
       mask_function,
       field_type,
       default_cache_value,
       entity_type_id,
       ac_id,
       ef_id,
       browser_group
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13,$14,$15)`,
            [
              data.field_title, // field_title
              data.field_tag, // field_tag
              data.unit, // unit
              data.is_computational || false, // is_computational
              data.last_value_function_name || null, // last_value_function_name
              data.all_values_function_name || null, // all_values_function_name
              data.is_static || false, // is_static
              data.static_value || '', // static_value
              data.mask_function || null, // mask_function
              data.field_type || 'Value', // field_type
              data.default_cache_value || null, // default_cache_value
              data.entity_type_id,
              data.ac_id,
              data.ef_id,
              data.browser_group,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(ef_id) FROM main.entity_fields',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.entity_fields ALTER COLUMN ef_id SET DEFAULT nextval('main.entity_fields_ef_id_seq');
          SELECT setval('main.entity_fields_ef_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();

        this.logger.log(
          `Successfully seeded ${entityFieldData.length} entity fields.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed entity fields:', error.message);
      throw error;
    }
  }
}
