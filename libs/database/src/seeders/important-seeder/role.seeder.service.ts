import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Role } from '../../postgresql';

@Injectable()
export class RoleSeeder {
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async seed() {
    const filePath = path.join(process.cwd(), 'data/roles.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedingData = JSON.parse(rawData);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const count = await this.roleRepository.count();
        if (count > 0) {
          this.logger.log('roles already exist, skipping seeding.');
          return;
        }

        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.role (
              id, name, description
            ) VALUES ($1, $2, $3)`,
            [data.id, data.name, data.description], // ✅ Fix: Add comma here
          );
        }

        await queryRunner.commitTransaction();
        this.logger.log(`Successfully seeded ${seedingData.length} roles.`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed roles:', error.message);
      throw error;
    }
  }
}
