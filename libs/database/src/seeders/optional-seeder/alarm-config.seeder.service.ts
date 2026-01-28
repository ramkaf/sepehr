import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AlarmConfig } from '../../postgresql';

@Injectable()
export class AlarmConfigSeeder {
  private readonly logger = new Logger(AlarmConfig.name);

  constructor(
    @InjectRepository(AlarmConfig)
    private readonly repository: Repository<AlarmConfig>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Alarm configs already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/alarm_config.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const datas = JSON.parse(rawData);
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.query(
          'ALTER TABLE main.alarm_config ALTER COLUMN ac_id DROP DEFAULT;',
        );
        for (const data of datas) {
          await queryRunner.query(
            `INSERT INTO main.alarm_config (ac_id, title, tag, plant_id) 
             VALUES ($1, $2, $3, $4)`,
            [data.ac_id, data.title, data.tag, data.plant_id],
          );
        }

        const result = await queryRunner.query(
          'SELECT MAX(ac_id) FROM main.alarm_config',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.alarm_config ALTER COLUMN ac_id SET DEFAULT nextval('main.alarm_config_ac_id_seq');
          SELECT setval('main.alarm_config_ac_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(`Successfully seeded ${datas.length} alarm configs.`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed alarm configs:', error.message);
      throw error;
    }
  }
}
