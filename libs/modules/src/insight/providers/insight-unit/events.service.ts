import { Injectable } from '@nestjs/common';
import { ALARM_LEVEL_ENUM_NAME } from 'libs/constants';
import { EntityModel } from 'libs/database';
import { PlantService } from '../plant-unit/plants.service';
import { PlantRepositoryService } from '../../repositories/plant.repository';
import { QueryRunner } from 'typeorm';

@Injectable()
export class PlantEventService {
  constructor(
    private plantRepoService: PlantRepositoryService,
    private readonly plantService: PlantService,
  ) {}
  private readonly schema = 'events';
  async ensurePlantsEventTableExist(queryRunner: QueryRunner): Promise<void> {
    const plants: EntityModel[] = await this.plantService.fetchPlants();
    plants.forEach(async (plant: EntityModel) => {
      await this.createPlantEventTable(plant, queryRunner);
    });
  }

  async createPlantEventTable(
    plant: EntityModel,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const { entityTag: plantTag } = plant;
    await this.plantService.updateAlertEnumValues(this.schema, queryRunner);
    const sql = `
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'events'
            AND table_name = '${plantTag}'
        ) THEN
            EXECUTE format($f$
                CREATE TABLE events.%I (
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
                    severity_str       ${this.schema}.${ALARM_LEVEL_ENUM_NAME},
                    description_str     varchar,
                    acknowledge_status  varchar,
                    ac_id               integer REFERENCES main.alarm_config,
                    default_cache_value varchar,
                    temp                varchar,
                    alert_id            integer REFERENCES main.alert_config_message ON DELETE CASCADE,
                    formal_message      varchar
                )
            $f$, '${plantTag}');
        END IF;
    END $$;
  `;
    await this.plantRepoService.executeRawQuery(plantTag, sql, queryRunner);
  }
  async revertEventTable(
    plant: EntityModel,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const { entityTag: plantTag } = plant;
    const sql = `DROP TABLE IF EXISTS events.${plantTag}`;
    await this.plantRepoService.executeRawQuery(plantTag, sql, queryRunner);
  }
}
