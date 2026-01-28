import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import {
  Chart,
  ChartDetail,
  ChartEntity,
  DetailField,
  User,
} from '../../postgresql';

@Injectable()
export class DetailFieldSeeder {
  private readonly logger = new Logger(DetailFieldSeeder.name);

  constructor(
    @InjectRepository(DetailField)
    private readonly repository: Repository<DetailField>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Detail fields already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/details_fields.json');
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
          'ALTER TABLE main.details_fields ALTER COLUMN df_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.details_fields (
      df_id, detail_id, field_id, unit ,devide_by ,  opr_type ,chart_type ) VALUES (
      $1, $2, $3, $4 , $5 , $6 , $7
    )`,
            [
              data.df_id,
              data.detail_id,
              data.field_id,
              data.unit,
              data.devide_by,
              data.opr_type,
              data.chart_type,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(df_id) FROM main.details_fields',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.details_fields ALTER COLUMN df_id SET DEFAULT nextval('main.details_fields_df_id_seq');
          SELECT setval('main.details_fields_df_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} details fields.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed detail fields', error.message);
      throw error;
    }
  }
}
