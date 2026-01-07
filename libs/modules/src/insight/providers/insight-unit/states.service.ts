import { Inject, Injectable } from '@nestjs/common';
import { PlantRepositoryService } from '../../repositories/plant.repository';
import { PlantService } from '../plant-unit/plants.service';
import { DataSource, QueryRunner } from 'typeorm';
import { EntityModel } from 'libs/database';
import { ALARM_LEVEL_ENUM_NAME } from 'libs/constants';
import { IStateResult } from 'libs/interfaces';

@Injectable()
export class PlantStateService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private plantRepoService: PlantRepositoryService,
    private readonly plantService: PlantService,
  ) {}
  private readonly schema = 'states';
  async ensurePlantsStateTableExist(queryRunner: QueryRunner): Promise<void> {
    const plants: EntityModel[] = await this.plantService.fetchPlants();
    plants.forEach(async (plant: EntityModel) => {
      await this.createPlantStateTable(plant, queryRunner);
    });
  }

  async createPlantStateTable(
    plant: EntityModel,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const { entityTag: plantTag } = plant;
    try {
      const sql = `
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'states'
            AND table_name = '${plantTag}'
        ) THEN
            EXECUTE format($f$
                CREATE TABLE states.%I (
                    id                  serial PRIMARY KEY,
                    source_str          varchar(100) REFERENCES main.entity(entity_tag) ON DELETE SET NULL,
                    start_date          timestamp with time zone,
                    reception_date      timestamp with time zone,
                    alarms_delay        integer,
                    energy_losses       real,
                    acknowledge_date    timestamp,
                    acknowledge_comment varchar,
                    status              varchar,
                    acknowledge_user    integer REFERENCES main.users ON DELETE SET NULL,
                    state_str           varchar,
                    severity_str        ${this.schema}.${ALARM_LEVEL_ENUM_NAME},
                    description_str     varchar,
                    acknowledge_status  varchar,
                    default_cache_value varchar,
                    value                varchar,
                    ef_id            integer REFERENCES main.entity_fields(ef_id) ON DELETE CASCADE
                )
            $f$, '${plantTag}');
        END IF;
    END $$;
  `;
      await this.plantRepoService.executeRawQuery(plantTag, sql, queryRunner);
    } catch (error) {
      console.log(error);
    }
  }
  async revertStateTable(
    plant: EntityModel,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const { entityTag: plantTag } = plant;
    const sql = `DROP TABLE IF EXISTS states.${plantTag}`;
    await this.plantRepoService.executeRawQuery(plantTag, sql, queryRunner);
  }
  async fetchActiveState(
    plantTag: string,
    sourceStr: string,
    fieldTitle: string,
  ) {
    const sql = `SELECT * FROM states.${plantTag} where source_str = $1 and description_str = $2 and reception_date is NULL`;
    const result = await this.dataSource.query(sql, [sourceStr, fieldTitle]);
    return result[0] || null;
  }
  async fetchDeviceStates(sourceStr: string): Promise<IStateResult> {
    const [plantTag, ,] = sourceStr.split(':');
    const { stateTable } =
      this.plantService.generatePlantTablesByPlantTag(plantTag);
    const sql = `
    SELECT
    e.id AS "stateId",
    e.source_str AS "sourceStr",
    CONCAT(SPLIT_PART(e.source_str, ':', 2), '-', ent.entity_name) AS "sourceTitle",
    e.start_date AT TIME ZONE 'Asia/Tehran' AS "startDate", 
    e.reception_date AS "receptionDate",
    e.acknowledge_date AS "acknowledgeDate",
    e.acknowledge_comment AS "acknowledgeComment",
    e.acknowledge_status AS "acknowledgeStatus",
    e.status,
    e.state_str AS "stateStr",
    e.severiry_str AS "severiryStr",
    e.description_str AS "descriptionStr",
    e.ef_id,
    CONCAT(u."firstName", ' ', u."lastName") AS "fullname"
    FROM ${stateTable} e
    LEFT JOIN main.users u ON e.acknowledge_user = u.id
    LEFT JOIN main.entity ent ON e.source_str = ent.entity_tag
    WHERE e.source_str = $1
      AND status <> 'notactive'
      AND e.ef_id IN (
          SELECT ef.ef_id
          FROM main.entity ent2
          JOIN main.entity_fields ef ON ent2.entity_type_id = ef.entity_type_id
          WHERE ent2.entity_tag = $1
            AND ef.browser_group LIKE '%State%'
      )
      ORDER BY e.id DESC;
    `;
    const states = await this.dataSource.query(sql, [sourceStr]);
    return states.map((item: any) => {
      const site = item.sourceStr.match(/^([^:]+)/)?.[1];
      return { ...item, site };
    });
  }
}
