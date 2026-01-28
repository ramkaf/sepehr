import { Logger } from '@nestjs/common';
import { PostgresSchemasEnum } from 'libs/enums';
import { DataSource } from 'typeorm';

export class SchemaInitializer {
  private readonly logger = new Logger(SchemaInitializer.name);

  // Required schemas to be initialized
  private requiredSchemas = Object.keys(PostgresSchemasEnum);

  constructor(private dataSource: DataSource) {}

  async initializeSchemas(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Get existing schemas
      const existingSchemas = await this.getExistingSchemas(queryRunner);

      // Create missing schemas
      for (const schema of this.requiredSchemas) {
        if (!existingSchemas.includes(schema)) {
          await this.createSchema(queryRunner, schema);
        }
      }

      this.logger.log('Schema initialization complete');
    } catch (error) {
      this.logger.error('Error during schema initialization', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async getExistingSchemas(queryRunner: any): Promise<string[]> {
    const result = await queryRunner.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE 
        schema_name NOT LIKE 'pg_%' 
        AND schema_name != 'information_schema'
    `);

    return result.map((row: any) => row.schema_name);
  }
  private async createSchema(
    queryRunner: any,
    schemaName: string,
  ): Promise<void> {
    try {
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      await queryRunner.query(
        `ALTER SCHEMA "${schemaName}" OWNER TO rasaddb_user`,
      );
      this.logger.log(`Schema "${schemaName}" created successfully`);
    } catch (error) {
      this.logger.error(`Error creating schema ${schemaName}:`, error);
      throw error;
    }
  }
}
