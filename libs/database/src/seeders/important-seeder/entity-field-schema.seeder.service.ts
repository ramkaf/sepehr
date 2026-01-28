import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { EntityFieldSchema } from '../../postgresql';
@Injectable()
export class EntityFieldSchemaSeeder {
  private readonly logger = new Logger(EntityFieldSchemaSeeder.name);

  constructor(
    @InjectRepository(EntityFieldSchema)
    private readonly repository: Repository<EntityFieldSchema>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity field schemas already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/entity_field_schema.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const entityFieldData = JSON.parse(rawData);

    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Insert data with specific IDs
        for (const data of entityFieldData) {
          await queryRunner.query(
            `INSERT INTO main.entity_field_schema (
                field_title,
                field_tag,
                unit,
                is_computational,
                last_value_function_name,
                all_values_function_name,
                is_static,
                mask_function
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              data.field_title, // field_title
              data.field_tag, // field_tag
              data.unit, // unit
              data.is_computational || false, // is_computational
              data.last_value_function_name || null, // last_value_function_name
              data.all_values_function_name || null, // all_values_function_name
              data.is_static || false, // is_static
              data.mask_function || null,
            ],
          );
        }
        await queryRunner.commitTransaction();

        this.logger.log(
          `Successfully seeded ${entityFieldData.length} entity field schemas.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed entity field schemas:', error.message);
      throw error;
    }
  }
}
