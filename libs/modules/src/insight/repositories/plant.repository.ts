import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PlantRepositoryService {
  private readonly logger = new Logger(PlantRepositoryService.name);
  constructor(private dataSource: DataSource) {}
  async executeRawQuery(
    plantName: string,
    query: string,
    queryRunner: any,
    parameters?: any[],
  ): Promise<any> {
    // const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();

      // Replace placeholder with actual table name
      const finalQuery = query.replace(/\{tableName\}/g, `events.${plantName}`);

      return await queryRunner.query(finalQuery, parameters);
    } catch (error) {
      this.logger.error(`Error executing raw query on ${plantName}:`, error);
      throw error;
    }
  }
}
