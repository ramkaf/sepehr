import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../postgresql';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('users already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/users.json');
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
          'ALTER TABLE main.users ALTER COLUMN id DROP DEFAULT;',
        );

        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.users (
      id, "firstName", "lastName", email, username, "roleId", mobile,
      password, "isActive", otp_method , access,old_role
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 , $11, $12
    )`,
            [
              data.id,
              data.firstName,
              data.lastName,
              data.email,
              data.username,
              1,
              data.mobile,
              data.password,
              data.isActive,
              'phone',
              data.role === 'User' ? 3 : 2,
              data.old_role,
            ],
          );
        }

        // Get the maximum ID to reset the sequence
        const result = await queryRunner.query(
          'SELECT MAX(id) FROM main.users',
        );
        const maxId = parseInt(result[0].max) || 0;

        // Reset the sequence to start from the next available ID
        await queryRunner.query(`
          ALTER TABLE main.users ALTER COLUMN id SET DEFAULT nextval('main.users_id_seq');
          SELECT setval('main.users_id_seq', ${maxId + 1}, false);
        `);

        await queryRunner.commitTransaction();
        this.logger.log(`Successfully seeded ${seedingData.length} users.`);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed users:', error.message);
      throw error;
    }
  }
}
