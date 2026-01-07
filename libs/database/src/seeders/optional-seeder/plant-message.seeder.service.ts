import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PlantMessage } from '../../postgresql';

@Injectable()
export class PlantMessageSeeder {
  private readonly logger = new Logger(PlantMessageSeeder.name);

  constructor(
    @InjectRepository(PlantMessage)
    private readonly repository: Repository<PlantMessage>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Plant messages already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/plant_message.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const plantMessageData = JSON.parse(rawData);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Temporarily disable the auto-increment behavior
        await queryRunner.query(
          'ALTER TABLE main.plant_message ALTER COLUMN ps_id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of plantMessageData) {
          await queryRunner.query(
            `INSERT INTO main.plant_message (ps_id ,ps_text, ps_value, ps_bit_no, ef_id, level, alarm_id, alarm_condition_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7,$8)`,
            [
              data.ps_id,
              data.ps_text,
              data.ps_value,
              data.ps_bit_no,
              data.ef_id, // Note: This matches the JSON's ef_id but needs to map to "efId" in the table
              data.level,
              data.alarm_id,
              data.alarm_condition_id,
            ],
          );
        }
        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(ps_id) FROM main.plant_message',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.plant_message ALTER COLUMN ps_id SET DEFAULT nextval('main.plant_message_ps_id_seq');
          SELECT setval('main.plant_message_ps_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${plantMessageData.length} plant messages.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed plant messages :', error.message);
      throw error;
    }
  }
}
