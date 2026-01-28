import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AlertConfigMessage, EntityModel } from '../../postgresql';

@Injectable()
export class AlertConfigMessageSeeder {
  private readonly logger = new Logger(AlertConfigMessageSeeder.name);

  constructor(
    @InjectRepository(AlertConfigMessage)
    private readonly repository: Repository<AlertConfigMessage>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Entity types already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/alert_config_message.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const entitesData = JSON.parse(rawData);
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.query(
          'ALTER TABLE main.alert_config_message ALTER COLUMN id DROP DEFAULT;',
        );
        for (const data of entitesData) {
          await queryRunner.query(
            `INSERT INTO main.alert_config_message (id, condition, value, message,severity, ef_id) 
             VALUES ($1, $2, $3, $4, $5,$6)`,
            [
              data.id,
              data.condition,
              data.value,
              data.message,
              data.severity,
              data.ef_id,
            ],
          );
        }

        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.alert_config_message',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.alert_config_message ALTER COLUMN id SET DEFAULT nextval('main.entity_e_id_seq');
          SELECT setval('main.entity_e_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${entitesData.length} alert config messages.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed alert config messages:', error.message);
      throw error;
    }
  }
}
