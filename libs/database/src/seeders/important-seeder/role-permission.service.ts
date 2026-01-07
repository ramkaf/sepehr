import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RolePermissionSeeder {
  private readonly logger = new Logger(RolePermissionSeeder.name);

  constructor(private dataSource: DataSource) {}

  async seed() {
    const filePath = path.join(
      process.cwd(),
      'data/role_permissions_permissions_nest.json',
    );
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedingData = JSON.parse(rawData);
    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Insert data with specific IDs
        for (const data of seedingData) {
          await queryRunner.query(
            `INSERT INTO main.role_permissions_permissions_nest (
                "roleId", "permissionsId"
                ) VALUES ($1, $2)
                ON CONFLICT ("roleId", "permissionsId") DO NOTHING`,
            [data.roleId, data.permissionsId],
          );
        }

        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully seeded ${seedingData.length} role_permissions_permissions_nest.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(
        'Failed to seed role_permissions_permissions_nest:',
        error.message,
      );
      throw error;
    }
  }
}
