import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentEntity } from '../../postgresql';

@Injectable()
export class DocumentSeeder {
  private readonly logger = new Logger(DocumentSeeder.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repository: Repository<DocumentEntity>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count > 0) {
      this.logger.log('Documents already exist, skipping seeding.');
      return;
    }

    const filePath = path.join(process.cwd(), 'data/documents.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const documentsData = JSON.parse(rawData);

    try {
      // Use the repository's entity manager to work with its connection
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Insert data with specific IDs
        for (const data of documentsData) {
          await queryRunner.query(
            `INSERT INTO main.documents (
            doc_id,
            real_name,
            format,
            uploaddate,
            updatedate,
            version,
            link_type,
            source,
            last_modifier,
            author,
            size,
            tags,
            isactive,
            plant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              data.doc_id,
              data.real_name,
              data.format,
              data.uploaddate,
              data.updatedate || null,
              data.version,
              data.link_type,
              data.source,
              data.last_modifier,
              data.author,
              data.size,
              data.tags,
              data.isactive,
              data.plant_id || null,
            ],
          );
        }
        await queryRunner.commitTransaction();

        this.logger.log(
          `Successfully seeded ${documentsData.length} documents.`,
        );
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to seed documents:', error.message);
      throw error;
    }
  }
}
