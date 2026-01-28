import { Inject, Injectable } from '@nestjs/common';
import { PlantService } from '../plant-unit/plants.service';
import { PlantRepositoryService } from '../../repositories/plant.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { ALARM_LEVEL_ENUM_NAME } from 'libs/constants';
import { EntityModel } from 'libs/database';
@Injectable()
export class PlantStatusService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private plantRepoService: PlantRepositoryService,
    private readonly plantService: PlantService,
  ) {}

  async ensurePlantsStatusTableExist(queryRunner: QueryRunner): Promise<void> {
    const plants: EntityModel[] = await this.plantService.fetchPlants();
    plants.forEach(async (plant: EntityModel) => {
      await this.createPlantStatusTable(plant, queryRunner);
    });
  }
  async createPlantStatusTable(
    plant: EntityModel,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const { eId, entityTag: plantTag } = plant;
    const schemas = ['status', 'status_alerts'];
    for (const schema of schemas) {
      const sql = `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = '${schema}'
                AND table_name = '${plantTag}'
            ) THEN
                EXECUTE format($f$
                    CREATE TABLE ${schema}.%I (
                        source_str          varchar(100) PRIMARY KEY UNIQUE REFERENCES main.entity(entity_tag) ON DELETE CASCADE,
                        formal_message      varchar,
                        level               ${schema}.${ALARM_LEVEL_ENUM_NAME},
                        status              varchar(20)
                    )
                $f$, '${plantTag}');
            END IF;
        END $$;

        INSERT INTO ${schema}.${plantTag} (source_str, formal_message, level, status)
        SELECT e.entity_tag, NULL, 'Normal', 'Normal'
        FROM main.entity e
        LEFT JOIN ${schema}.${plantTag} q ON q.source_str = e.entity_tag
        WHERE q.source_str IS NULL
          AND e.entity_type_id IN (
            SELECT et_id FROM main.entity_types
            WHERE plant_id = ${eId}
          );
      `;

      await this.plantRepoService.executeRawQuery(plantTag, sql, queryRunner);
    }
  }
  async revertStatusTables(
    plant: EntityModel,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const { entityTag: plantTag } = plant;
    const schemas = ['status', 'status_alerts'];
    schemas.forEach(async (schema) => {
      const sql = `DROP TABLE IF EXISTS ${schema}.${plantTag}`;
      await this.plantRepoService.executeRawQuery(plantTag, sql, queryRunner);
    });
  }

  async fetchPlantStatus(plantTag: string) {
    const statusTable = `status.${plantTag}`;
    const query = `SELECT * FROM ${statusTable}`;
    const result = await this.dataSource.query(query, []);
    return result;
  }
  async fetchMetersStatus(plantTag: string) {
    const statusTable = `status.${plantTag}`;
    const sql = `SELECT * FROM ${statusTable} s INNER JOIN main.entity e on e.entity_tag = s.source_str INNER JOIN main.entity_types et on e.entity_type_id = et.et_id WHERE( source_str LIKE '%MV%' OR source_str LIKE '%HV%') AND et.abstraction_level = 'Device';`;
    const result = await this.dataSource.query(sql, []);
    return result;
  }
}
